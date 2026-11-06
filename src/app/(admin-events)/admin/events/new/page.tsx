import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EventForm from '../_components/EventForm';
import { newEventDefaults } from '../_components/types';
import { AdminHero } from '../_components/AdminHero';

export default function NewEventPage() {
  return (
    <div>
      <Link href="/admin/events" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden />
        All events
      </Link>
      <div className="mt-3">
        <AdminHero
          title="New event"
          description="Three tiers are pre-filled with this season’s prices. Adjust anything before creating. Times are Pacific."
        />
      </div>
      <EventForm mode="create" initial={newEventDefaults()} />
    </div>
  );
}

export const dynamic = 'force-dynamic';
