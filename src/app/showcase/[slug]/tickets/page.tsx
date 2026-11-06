import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Crown, TicketX } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import {
  displayPriceCents,
  onlineSalesState,
  priceCentsForTier,
  remainingForTier,
  salesAreOpen,
  tierIsBuyable,
} from '@/lib/ticketing';
import { Badge } from '@/components/ui/Badge';
import { HeroBackdrop } from '../../_components/HeroBackdrop';
import { EventMetaChips } from '../../_components/EventMetaChips';
import { SalesStatePill, salesStateDetail } from '../../_components/SalesStatePill';
import TicketPurchaseForm, { type TierView } from './TicketPurchaseForm';

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return { title: 'Tickets · Spirit Athletics' };
  return {
    title: `${event.title} · Tickets`,
    description: event.description || `Buy tickets for ${event.title}.`,
  };
}

export default async function TicketsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { tiers: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!event || event.status === 'DRAFT') notFound();

  const now = new Date();
  const state = onlineSalesState(event, event.tiers, now);

  const tiers: TierView[] = event.tiers
    .filter((t) => t.showOnline)
    .map((t) => {
      const live = priceCentsForTier(event, t, now);
      const shown = displayPriceCents(t, state);
      const remaining = remainingForTier(t);
      return {
        id: t.id,
        tierCode: t.tierCode,
        name: t.name,
        description: t.description,
        priceCents: live?.priceCents ?? shown.cents,
        earlyBird: live ? live.window === 'EARLY_BIRD' : shown.earlyBird,
        remaining,
        soldOut: remaining != null && remaining <= 0,
        buyable: tierIsBuyable(event, t, now),
      };
    });

  const canCheckout = salesAreOpen(event, now) && tiers.some((t) => t.buyable);
  const detail = salesStateDetail(state);

  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-900">
      <header className="relative isolate overflow-hidden bg-ink text-white">
        <HeroBackdrop compact imageUrl={event.heroImageUrl} />
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-3 sm:px-6 sm:pb-20 sm:pt-6">
          <Link
            href="/showcase"
            className="-ml-2.5 inline-flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Spirit Spectacular
          </Link>
          <div className="mt-4 motion-safe:animate-rise sm:mt-6">
            <SalesStatePill state={state} />
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:mt-4 sm:text-5xl">{event.title}</h1>
            <div className="mt-4 sm:mt-5">
              <EventMetaChips
                startDateTimeUTC={event.startDateTimeUTC}
                doorsOpenUTC={event.doorsOpenUTC}
                venue={event.venue}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto -mt-8 max-w-6xl px-4 pb-16 sm:px-6">
        {canCheckout ? (
          <TicketPurchaseForm slug={event.slug} tiers={tiers} feeCents={event.convenienceFeeCents} note={detail} />
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 motion-safe:animate-rise">
            <div className="rounded-3xl bg-white p-6 shadow-soft-lg ring-1 ring-slate-200/70 sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-spirit-50 text-spirit">
                {state.kind === 'UPCOMING' ? <Clock className="size-6" /> : <TicketX className="size-6" />}
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight">
                {state.kind === 'UPCOMING'
                  ? 'Tickets aren’t on sale online yet'
                  : state.kind === 'CLOSED'
                  ? 'Online sales have closed'
                  : 'Sold out online'}
              </h2>
              <p className="mt-2 text-slate-600">
                {state.kind === 'UPCOMING' || state.kind === 'CLOSED'
                  ? detail ?? 'Online sales for this event have closed.'
                  : 'Every ticket type available online has sold out.'}
              </p>
            </div>
            {tiers.length > 0 ? (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/70">
                {tiers.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-semibold">
                        {t.tierCode === 'VIP' ? <Crown className="size-4 text-amber-500" aria-hidden /> : null}
                        {t.name}
                      </div>
                      {t.description ? <div className="truncate text-sm text-slate-500">{t.description}</div> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {t.soldOut ? <Badge tone="red">Sold out</Badge> : null}
                      <span className="font-semibold tabular-nums">{dollars(t.priceCents)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-slate-500">
          Tickets are exchanged at the door for a wristband, which is also your re-entry pass. Lost wristbands can&apos;t be
          replaced. All sales are final: no refunds or transfers. A {dollars(event.convenienceFeeCents)} online
          convenience fee applies per order.
        </p>
      </main>
    </div>
  );
}

// Inventory needs to be fresh on each request.
export const dynamic = 'force-dynamic';
