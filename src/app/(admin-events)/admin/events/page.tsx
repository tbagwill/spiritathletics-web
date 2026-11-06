import Link from 'next/link';
import { CalendarPlus, ExternalLink, Pencil, Plus, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPt } from '@/lib/time';
import { onlineSalesState } from '@/lib/ticketing';
import { buttonStyles } from '@/components/ui/Button';
import { SalesStatePill } from '@/app/showcase/_components/SalesStatePill';
import { StatusBadge } from './_components/StatusBadge';
import { AdminHero } from './_components/AdminHero';

function dollars(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminEventsOverview() {
  const events = await prisma.event.findMany({
    orderBy: { startDateTimeUTC: 'desc' },
    include: { tiers: { orderBy: { sortOrder: 'asc' } }, _count: { select: { orders: true } } },
  });

  const stats = await Promise.all(
    events.map(async (e) => {
      const [revenue, checkedIn] = await Promise.all([
        prisma.ticketOrder.aggregate({ where: { eventId: e.id, status: 'PAID' }, _sum: { totalCents: true } }),
        prisma.ticket.count({ where: { status: 'REDEEMED', order: { eventId: e.id } } }),
      ]);
      return { revenueCents: revenue._sum.totalCents || 0, checkedIn };
    }),
  );

  const now = new Date();
  const totals = {
    active: events.filter((e) => e.status === 'ACTIVE').length,
    sold: events.reduce((n, e) => n + e.tiers.reduce((m, t) => m + t.sold, 0), 0),
    revenueCents: stats.reduce((n, s) => n + s.revenueCents, 0),
  };

  return (
    <div>
      <AdminHero
        title="Ticketed events"
        description="Create and manage Spirit Spectacular showcases and other ticketed events."
        actions={
          <Link href="/admin/events/new" className={buttonStyles({ variant: 'white' })}>
            <Plus className="size-4" aria-hidden />
            New event
          </Link>
        }
      >
        <dl className="mt-7 grid grid-cols-3 gap-2 sm:max-w-lg">
          {[
            ['Active events', totals.active.toLocaleString()],
            ['Tickets sold', totals.sold.toLocaleString()],
            ['Revenue', dollars(totals.revenueCents)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white/10 px-3.5 py-3 ring-1 ring-inset ring-white/15">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-white/65">{label}</dt>
              <dd className="mt-1 truncate text-lg font-semibold tabular-nums tracking-tight">{value}</dd>
            </div>
          ))}
        </dl>
      </AdminHero>

      {events.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-spirit-50 text-spirit">
            <CalendarPlus className="size-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">No events yet</h2>
          <p className="mt-1 text-slate-600">Create your first event to start selling tickets online.</p>
          <Link href="/admin/events/new" className={buttonStyles({ variant: 'dark', className: 'mt-6' })}>
            Create event
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {events.map((event, i) => {
            const sold = event.tiers.reduce((n, t) => n + t.sold, 0);
            const { revenueCents, checkedIn } = stats[i];
            const state = onlineSalesState(event, event.tiers, now);
            return (
              <article
                key={event.id}
                className="flex flex-col rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200/70 transition-shadow duration-300 hover:shadow-soft-lg motion-safe:animate-rise"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={event.status} />
                      {event.status === 'ACTIVE' ? <SalesStatePill state={state} onDark={false} /> : null}
                    </div>
                    <h2 className="mt-3 truncate text-lg font-semibold tracking-tight text-slate-900">
                      <Link href={`/admin/events/${event.id}`} className="hover:underline">
                        {event.title}
                      </Link>
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {formatPt(event.startDateTimeUTC, "EEE, MMM d · h:mm a 'PT'")}
                      {event.venue ? ` · ${event.venue}` : ''}
                    </p>
                  </div>
                  <div className="flex w-14 shrink-0 flex-col items-center overflow-hidden rounded-2xl ring-1 ring-slate-200">
                    <div className="w-full bg-spirit py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
                      {formatPt(event.startDateTimeUTC, 'MMM')}
                    </div>
                    <div className="py-1.5 text-xl font-semibold tabular-nums text-slate-900">
                      {formatPt(event.startDateTimeUTC, 'd')}
                    </div>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-3 gap-2">
                  <Stat label="Tickets sold" value={sold.toLocaleString()} highlight />
                  <Stat label="Checked in" value={checkedIn.toLocaleString()} sub={sold ? `${Math.round((checkedIn / sold) * 100)}%` : undefined} />
                  <Stat label="Revenue" value={dollars(revenueCents)} sub={`${event._count.orders} orders`} />
                </dl>

                <ul className="mt-4 space-y-1.5">
                  {event.tiers.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className={t.showOnline ? 'text-slate-700' : 'text-slate-400'}>
                        {t.name}
                        {!t.showOnline ? ' · hidden online' : ''}
                      </span>
                      <span className="tabular-nums text-slate-500">
                        {t.sold}
                        {t.capacity != null ? ` / ${t.capacity}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Link href={`/admin/events/${event.id}`} className={buttonStyles({ variant: 'primary', size: 'sm' })}>
                    <Pencil className="size-3.5" aria-hidden />
                    Edit
                  </Link>
                  <Link href={`/dashboard/events/${event.slug}`} className={buttonStyles({ variant: 'outline', size: 'sm' })}>
                    <Users className="size-3.5" aria-hidden />
                    Attendance
                  </Link>
                  <a
                    href={`/showcase/${event.slug}/tickets`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                    Ticket page
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={highlight ? 'rounded-2xl bg-spirit-50 px-3 py-3' : 'rounded-2xl bg-slate-50 px-3 py-3'}>
      <dt className={highlight ? 'text-[11px] font-medium uppercase tracking-wide text-spirit/80' : 'text-[11px] font-medium uppercase tracking-wide text-slate-500'}>
        {label}
      </dt>
      <dd
        className={
          highlight
            ? 'mt-1 truncate text-lg font-semibold tabular-nums tracking-tight text-spirit'
            : 'mt-1 truncate text-lg font-semibold tabular-nums tracking-tight text-slate-900'
        }
      >
        {value}
      </dd>
      {sub ? <dd className="text-xs text-slate-500">{sub}</dd> : null}
    </div>
  );
}

export const dynamic = 'force-dynamic';
