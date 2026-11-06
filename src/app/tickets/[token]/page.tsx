import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import QRCode from 'qrcode';
import { CalendarDays, CircleCheck, Crown, MapPin, Sun, Ticket, Users, Wifi } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPt } from '@/lib/time';
import { orderQrPayload } from '@/lib/ticketing';
import { cn } from '@/components/ui/cn';
import { HeroBackdrop } from '@/app/showcase/_components/HeroBackdrop';

export const metadata: Metadata = {
  title: 'Your Tickets · Spirit Athletics',
  robots: { index: false, follow: false },
};

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function qrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, { type: 'svg', errorCorrectionLevel: 'M', margin: 2 });
}

const TIER_ACCENT: Record<string, string> = {
  STANDARD: 'bg-spirit',
  SENIOR_CHILD: 'bg-emerald-500',
  VIP: 'bg-amber-400',
};

function RevealPill() {
  return (
    <span className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-spirit transition-colors group-open:bg-slate-100 group-open:text-slate-700">
      <span className="group-open:hidden">Tap to reveal</span>
      <span className="hidden group-open:inline">Tap to hide</span>
    </span>
  );
}

// No entrance animation on anything holding a QR: it must be scannable the instant the page paints.
function QrPanel({ svg, label, caption }: { svg: string; label: string; caption?: string }) {
  return (
    <div className="perforation">
      <div className="px-5 pb-6 pt-6">
        <div
          role="img"
          aria-label={label}
          className="mx-auto w-full max-w-[300px] rounded-2xl bg-white p-2 ring-1 ring-slate-200 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
          // SVG is generated server-side by the qrcode library from our own token.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        {caption ? <p className="mt-4 text-center text-sm text-slate-600">{caption}</p> : null}
      </div>
    </div>
  );
}

export default async function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await prisma.ticketOrder.findUnique({
    where: { accessToken: token },
    include: {
      event: true,
      tickets: {
        include: { tier: true },
        orderBy: [{ tier: { sortOrder: 'asc' } }, { createdAt: 'asc' }],
      },
    },
  });
  if (!order) notFound();

  const { event, tickets } = order;
  const voided = order.status !== 'PAID';
  const activeCount = tickets.filter((t) => t.status === 'ACTIVE').length;

  const [orderSvg, ticketSvgs] = await Promise.all([
    !voided && activeCount > 0 ? qrSvg(orderQrPayload(order.accessToken)) : Promise.resolve(null),
    Promise.all(tickets.map((t) => (!voided && t.status === 'ACTIVE' ? qrSvg(t.qrToken) : Promise.resolve(null)))),
  ]);

  const tierTotals = new Map<string, number>();
  for (const t of tickets) tierTotals.set(t.tierId, (tierTotals.get(t.tierId) || 0) + 1);
  const tierSeen = new Map<string, number>();
  const rows = tickets.map((t, i) => {
    const n = (tierSeen.get(t.tierId) || 0) + 1;
    tierSeen.set(t.tierId, n);
    return { ticket: t, n, of: tierTotals.get(t.tierId) || 1, svg: ticketSvgs[i] };
  });

  const orderLabel =
    tickets.length === 1
      ? 'Check in your ticket'
      : activeCount === tickets.length
      ? `Check in all ${tickets.length} tickets`
      : `Check in remaining ${plural(activeCount, 'ticket')}`;

  return (
    <div
      className="relative isolate min-h-screen overflow-hidden bg-ink font-sans text-white"
      style={{ ['--perf-bg' as string]: 'var(--color-ink)' }}
    >
      <HeroBackdrop compact />
      <div className="mx-auto max-w-md px-4 pb-16 pt-8 sm:pt-12">
        <header className="motion-safe:animate-rise">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Your tickets</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight">{event.title}</h1>
          <div className="mt-4 space-y-1.5 text-sm text-white/70">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-white/45" aria-hidden />
              {formatPt(event.startDateTimeUTC, "EEE, MMM d · h:mm a 'PT'")}
              {event.doorsOpenUTC ? ` · Doors ${formatPt(event.doorsOpenUTC, 'h:mm a')}` : ''}
            </p>
            {event.venue ? (
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/45" aria-hidden />
                <span>
                  {event.venue}
                  {event.venueAddress ? <span className="block text-white/50">{event.venueAddress}</span> : null}
                </span>
              </p>
            ) : null}
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3.5 py-1.5 text-sm ring-1 ring-inset ring-white/10">
            <Ticket className="size-4 text-white/60" aria-hidden />
            {order.customerName} · {plural(tickets.length, 'ticket')}
          </div>
        </header>

        {voided ? (
          <div className="mt-6 rounded-3xl bg-red-500/15 p-5 text-sm text-red-100 ring-1 ring-inset ring-red-400/30">
            This order was {order.status === 'REFUNDED' ? 'refunded' : 'canceled'}. These tickets are no longer valid.
          </div>
        ) : orderSvg ? (
          <details name="ticket-qr" className="group mt-6 overflow-hidden rounded-[28px] bg-white text-slate-900 shadow-2xl">
            <summary className="summary-clean bg-spirit-gradient flex cursor-pointer items-center gap-4 p-5 text-white">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25">
                <Users className="size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold tracking-tight">{orderLabel}</span>
                <span className="block text-sm text-white/75">
                  {tickets.length === 1 ? 'Show this code at the door.' : 'One scan for your whole group.'}
                </span>
              </span>
              <RevealPill />
            </summary>
            <QrPanel
              svg={orderSvg}
              label={orderLabel}
              caption={`Staff will hand you ${plural(activeCount, 'wristband')}.`}
            />
          </details>
        ) : (
          <div className="mt-6 flex items-center gap-3 rounded-3xl bg-emerald-500/15 p-5 text-emerald-100 ring-1 ring-inset ring-emerald-400/30 motion-safe:animate-pop">
            <CircleCheck className="size-6 shrink-0 text-emerald-300" aria-hidden />
            <span className="font-medium">
              {tickets.length === 1 ? "You're checked in." : "Everyone's checked in."} Enjoy the show!
            </span>
          </div>
        )}

        {tickets.length > 1 ? (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50">Individual tickets</h2>
            </div>
            <p className="mt-1 text-sm text-white/60">Splitting up? Each person can show their own code.</p>
            <div className="mt-4 space-y-3">
              {rows.map(({ ticket, n, of, svg }) => {
                const accent = TIER_ACCENT[ticket.tier.tierCode] || 'bg-spirit';
                const heading = (
                  <span className="flex min-w-0 flex-1 items-center gap-3.5">
                    <span className={cn('h-10 w-1.5 shrink-0 rounded-full', accent)} aria-hidden />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-semibold tracking-tight">
                        {ticket.tier.tierCode === 'VIP' ? <Crown className="size-4 text-amber-400" aria-hidden /> : null}
                        {ticket.tier.name}
                      </span>
                      <span className="block text-sm opacity-60">
                        Ticket {n} of {of}
                      </span>
                    </span>
                  </span>
                );
                if (svg) {
                  return (
                    <details
                      key={ticket.id}
                      name="ticket-qr"
                      className="group overflow-hidden rounded-3xl bg-white/[0.06] ring-1 ring-inset ring-white/10 transition-colors open:bg-white open:text-slate-900"
                    >
                      <summary className="summary-clean flex cursor-pointer items-center gap-3 p-4">
                        {heading}
                        <RevealPill />
                      </summary>
                      <QrPanel svg={svg} label={`${ticket.tier.name} ticket ${n} of ${of}`} />
                    </details>
                  );
                }
                return (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-3 rounded-3xl bg-white/[0.03] p-4 text-white/55 ring-1 ring-inset ring-white/5"
                  >
                    {heading}
                    <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
                      {ticket.status === 'REDEEMED' ? (
                        <>
                          <CircleCheck className="size-4 text-emerald-400" aria-hidden />
                          {ticket.redeemedAt ? `In ${formatPt(ticket.redeemedAt, 'h:mm a')}` : 'Checked in'}
                        </>
                      ) : (
                        'Void'
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mt-10 rounded-3xl bg-white/[0.04] p-5 ring-1 ring-inset ring-white/10">
          <h2 className="font-semibold">Before you go</h2>
          <ul className="mt-4 space-y-3.5 text-sm text-white/70">
            <li className="flex gap-3">
              <Wifi className="mt-0.5 size-4 shrink-0 text-white/45" aria-hidden />
              Cell service at the venue can be spotty. Open this page before you arrive.
            </li>
            <li className="flex gap-3">
              <Sun className="mt-0.5 size-4 shrink-0 text-white/45" aria-hidden />
              Turn your screen brightness up when you&apos;re scanned.
            </li>
            <li className="flex gap-3">
              <Ticket className="mt-0.5 size-4 shrink-0 text-white/45" aria-hidden />
              Each ticket becomes a wristband, your re-entry pass. Lost wristbands can&apos;t be replaced.
            </li>
          </ul>
        </section>

        <p className="mt-8 text-center text-xs text-white/35">
          Order {order.id.slice(-8).toUpperCase()} · All sales final · frontdesk@spiritathletics.net
        </p>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
