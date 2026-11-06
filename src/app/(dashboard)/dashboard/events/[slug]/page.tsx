import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, ScanLine } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { buttonStyles } from '@/components/ui/Button';
import { HeroBackdrop } from '@/app/showcase/_components/HeroBackdrop';
import { EventMetaChips } from '@/app/showcase/_components/EventMetaChips';
import AttendanceBoard from './AttendanceBoard';

export default async function EventAttendancePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();

  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-900">
      <header className="relative isolate overflow-hidden bg-ink text-white">
        <HeroBackdrop compact />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6">
          <Link
            href="/dashboard"
            className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Dashboard
          </Link>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Attendance</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{event.title}</h1>
              <div className="mt-4">
                <EventMetaChips
                  startDateTimeUTC={event.startDateTimeUTC}
                  doorsOpenUTC={event.doorsOpenUTC}
                  venue={event.venue}
                />
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href={`/dashboard/events/${slug}/scan`} className={buttonStyles({ variant: 'white', size: 'lg' })}>
                <ScanLine className="size-5" aria-hidden />
                Open scanner
              </Link>
              <a href={`/api/dashboard/events/${slug}/export`} className={buttonStyles({ variant: 'glass', size: 'lg' })}>
                <Download className="size-4" aria-hidden />
                <span className="hidden sm:inline">Export CSV</span>
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className="relative mx-auto -mt-12 max-w-6xl px-4 pb-16 sm:px-6">
        <AttendanceBoard slug={slug} />
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
