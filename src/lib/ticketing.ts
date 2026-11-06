import type { Event, TicketTier } from '@prisma/client';

export type SalesWindow = 'BEFORE' | 'EARLY_BIRD' | 'GAP' | 'DOOR' | 'CLOSED';

/** Classify the current time against an event's four sales-window timestamps. */
export function currentSalesWindow(event: Event, now: Date = new Date()): SalesWindow {
  if (now < event.salesOpenAtUTC) return 'BEFORE';
  if (now <= event.earlyBirdEndsAtUTC) return 'EARLY_BIRD';
  if (now < event.doorSalesOpenAtUTC) return 'GAP';
  if (now < event.salesCloseAtUTC) return 'DOOR';
  return 'CLOSED';
}

/** Is the event currently accepting online purchases? */
export function salesAreOpen(event: Event, now: Date = new Date()): boolean {
  if (event.status !== 'ACTIVE') return false;
  const win = currentSalesWindow(event, now);
  return win === 'EARLY_BIRD' || win === 'DOOR';
}

/** What price should a given tier charge RIGHT NOW? Returns null if that tier can't be sold right now. */
export function priceCentsForTier(
  event: Event,
  tier: TicketTier,
  now: Date = new Date(),
): { priceCents: number; window: 'EARLY_BIRD' | 'DOOR' } | null {
  if (!tier.showOnline) return null;
  if (!salesAreOpen(event, now)) return null;
  const win = currentSalesWindow(event, now);
  if (win === 'EARLY_BIRD') {
    if (!tier.earlyBirdEnabled) return null;
    return { priceCents: tier.earlyBirdPriceCents, window: 'EARLY_BIRD' };
  }
  if (win === 'DOOR') {
    return { priceCents: tier.doorPriceCents, window: 'DOOR' };
  }
  return null;
}

export type OnlineSalesState =
  | { kind: 'UPCOMING'; opensAt: Date; afterEarlyBird: boolean; opensWithEarlyBird: boolean }
  | { kind: 'EARLY_BIRD'; endsAt: Date }
  | { kind: 'DOOR'; closesAt: Date }
  | { kind: 'CLOSED' };

/**
 * What a buyer should be told right now. Unlike currentSalesWindow, this accounts for tiers:
 * an Early Bird window with no Early Bird tier online (door-only launch) reads as "opens at door time".
 */
export function onlineSalesState(
  event: Event,
  tiers: Pick<TicketTier, 'showOnline' | 'earlyBirdEnabled'>[],
  now: Date = new Date(),
): OnlineSalesState {
  if (event.status === 'CLOSED' || event.status === 'COMPLETED') return { kind: 'CLOSED' };
  const earlyBirdOnline = tiers.some((t) => t.showOnline && t.earlyBirdEnabled);
  const win = currentSalesWindow(event, now);
  switch (win) {
    case 'BEFORE':
      return {
        kind: 'UPCOMING',
        opensAt: earlyBirdOnline ? event.salesOpenAtUTC : event.doorSalesOpenAtUTC,
        afterEarlyBird: false,
        opensWithEarlyBird: earlyBirdOnline,
      };
    case 'EARLY_BIRD':
      return earlyBirdOnline
        ? { kind: 'EARLY_BIRD', endsAt: event.earlyBirdEndsAtUTC }
        : { kind: 'UPCOMING', opensAt: event.doorSalesOpenAtUTC, afterEarlyBird: false, opensWithEarlyBird: false };
    case 'GAP':
      return {
        kind: 'UPCOMING',
        opensAt: event.doorSalesOpenAtUTC,
        afterEarlyBird: earlyBirdOnline,
        opensWithEarlyBird: false,
      };
    case 'DOOR':
      return { kind: 'DOOR', closesAt: event.salesCloseAtUTC };
    default:
      return { kind: 'CLOSED' };
  }
}

/** Price to advertise for a tier: Early Bird while it's on sale online, or when sales are about to open with it. */
export function displayPriceCents(tier: TicketTier, state: OnlineSalesState): { cents: number; earlyBird: boolean } {
  const earlyBirdWindow = state.kind === 'EARLY_BIRD' || (state.kind === 'UPCOMING' && state.opensWithEarlyBird);
  const earlyBird = earlyBirdWindow && tier.earlyBirdEnabled;
  return { cents: earlyBird ? tier.earlyBirdPriceCents : tier.doorPriceCents, earlyBird };
}

/** Remaining online inventory for a tier (null = uncapped). */
export function remainingForTier(tier: TicketTier): number | null {
  if (tier.capacity == null) return null;
  return Math.max(0, tier.capacity - tier.sold);
}

/** Is a tier buyable right now (window open, not sold out, visible)? */
export function tierIsBuyable(event: Event, tier: TicketTier, now: Date = new Date()): boolean {
  if (priceCentsForTier(event, tier, now) == null) return false;
  const remaining = remainingForTier(tier);
  return remaining == null || remaining > 0;
}

/** Generate a URL-safe unguessable QR token (long enough that scanning collisions are impossible). */
export function generateQrToken(): string {
  // 32 random bytes → 43 url-safe base64 chars → ~256 bits of entropy
  const bytes = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    // Node fallback (route handlers run on Node runtime)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomBytes } = require('crypto') as typeof import('crypto');
    const b = randomBytes(32);
    for (let i = 0; i < 32; i++) bytes[i] = b[i];
  }
  let b64 = Buffer.from(bytes).toString('base64');
  b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return b64;
}

// Ticket tokens are base64url (no ':'), so this prefix can't collide with one.
const ORDER_QR_PREFIX = 'O:';

/** QR payload that checks in every remaining ticket on an order. */
export function orderQrPayload(accessToken: string): string {
  return `${ORDER_QR_PREFIX}${accessToken}`;
}

/** Returns the order access token if the scanned text is an order QR, else null. */
export function parseOrderQrPayload(scanned: string): string | null {
  return scanned.startsWith(ORDER_QR_PREFIX) ? scanned.slice(ORDER_QR_PREFIX.length) : null;
}

export function ticketPagePath(accessToken: string): string {
  return `/tickets/${accessToken}`;
}
