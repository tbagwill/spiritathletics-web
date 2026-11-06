import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatPt, toPtDateTimeLocal } from '@/lib/time';
import { buttonStyles } from '@/components/ui/Button';
import EventForm from '../_components/EventForm';
import { StatusBadge } from '../_components/StatusBadge';
import { AdminHero } from '../_components/AdminHero';
import type { EventFormValues } from '../_components/types';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      tiers: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { orders: true } },
    },
  });
  if (!event) notFound();

  const initial: EventFormValues = {
    slug: event.slug,
    title: event.title,
    description: event.description || '',
    venue: event.venue || '',
    venueAddress: event.venueAddress || '',
    heroImageUrl: event.heroImageUrl || '',
    startDateTime: toPtDateTimeLocal(event.startDateTimeUTC),
    doorsOpen: event.doorsOpenUTC ? toPtDateTimeLocal(event.doorsOpenUTC) : '',
    endDateTime: event.endDateTimeUTC ? toPtDateTimeLocal(event.endDateTimeUTC) : '',
    salesOpenAt: toPtDateTimeLocal(event.salesOpenAtUTC),
    earlyBirdEndsAt: toPtDateTimeLocal(event.earlyBirdEndsAtUTC),
    doorSalesOpenAt: toPtDateTimeLocal(event.doorSalesOpenAtUTC),
    salesCloseAt: toPtDateTimeLocal(event.salesCloseAtUTC),
    convenienceFeeCents: event.convenienceFeeCents,
    status: event.status,
    tiers: event.tiers.map((t) => ({
      id: t.id,
      tierCode: t.tierCode,
      name: t.name,
      description: t.description || '',
      earlyBirdPriceCents: t.earlyBirdPriceCents,
      doorPriceCents: t.doorPriceCents,
      capacity: t.capacity,
      showOnline: t.showOnline,
      earlyBirdEnabled: t.earlyBirdEnabled,
      sortOrder: t.sortOrder,
      sold: t.sold,
    })),
  };

  return (
    <div>
      <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden />
        All events
      </Link>
      <div className="mt-3">
        <AdminHero
          eyebrow={
            <>
              <StatusBadge status={event.status} />
              <span>{formatPt(event.startDateTimeUTC, "EEE, MMM d, yyyy 'at' h:mm a 'PT'")}</span>
            </>
          }
          title={event.title}
          actions={
            <>
              <Link href={`/dashboard/events/${event.slug}`} className={buttonStyles({ variant: 'white', size: 'sm' })}>
                <Users className="size-4" aria-hidden />
                Attendance
              </Link>
              <a
                href={`/showcase/${event.slug}/tickets`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonStyles({ variant: 'glass', size: 'sm' })}
              >
                <ExternalLink className="size-4" aria-hidden />
                Ticket page
              </a>
            </>
          }
        />
      </div>
      <EventForm mode="edit" eventId={event.id} initial={initial} orderCount={event._count.orders} />
    </div>
  );
}

export const dynamic = 'force-dynamic';
