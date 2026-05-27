import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAvailablePrivateSlots } from '@/lib/availability';
import { formatPt } from '@/lib/time';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { addDays, set } from 'date-fns';

export const dynamic = 'force-dynamic';

const APP_TZ = 'America/Los_Angeles';
const QUICK_BOOK_DURATION = 60;
const DAYS_TO_SHOW = 5;

/** Returns the next N business days (Mon–Fri) starting from today PT (inclusive if today is a weekday). */
function getNextBusinessDays(count: number): Date[] {
  const nowPT = toZonedTime(new Date(), APP_TZ);
  const todayMidnightPT = set(nowPT, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });

  const days: Date[] = [];
  let cursor = todayMidnightPT;
  while (days.length < count) {
    const dow = cursor.getDay(); // 0=Sun, 6=Sat
    if (dow !== 0 && dow !== 6) {
      // Convert this PT midnight back to a UTC Date so getAvailablePrivateSlots receives the right value
      days.push(fromZonedTime(cursor, APP_TZ));
    }
    cursor = addDays(cursor, 1);
  }
  return days;
}

export async function GET() {
  try {
    // Load all active coaches with a private service
    const profiles = await prisma.coachProfile.findMany({
      where: {
        isActive: true,
        services: { some: { type: 'PRIVATE', isActive: true } },
      },
      include: {
        user: { select: { name: true } },
        services: { where: { type: 'PRIVATE', isActive: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });

    const coaches = profiles
      .map((p) => {
        const svc = p.services[0];
        if (!svc) return null;
        return { id: p.id, name: p.user?.name ?? 'Coach', serviceId: svc.id };
      })
      .filter(Boolean) as { id: string; name: string; serviceId: string }[];

    if (coaches.length === 0) {
      return NextResponse.json({ ok: true, days: [] });
    }

    const businessDays = getNextBusinessDays(DAYS_TO_SHOW);

    // Fan out: one getAvailablePrivateSlots call per coach per day
    type SlotResult = {
      coach: { id: string; name: string; serviceId: string };
      date: Date;
      slots: { startUTC: Date; endUTC: Date; display: string }[];
    };

    const tasks = businessDays.flatMap((date) =>
      coaches.map(async (coach): Promise<SlotResult> => {
        const slots = await getAvailablePrivateSlots({
          coachId: coach.id,
          localDate: date,
          durationMinutes: QUICK_BOOK_DURATION,
        });
        return { coach, date, slots };
      })
    );

    const results = await Promise.all(tasks);

    // Group by day -> time slot, collecting coaches per slot
    // Key: "YYYY-MM-DD|startMinutes" to deduplicate same time across coaches
    type CoachSlot = {
      id: string;
      name: string;
      serviceId: string;
      startUTC: string;
      endUTC: string;
    };

    type TimeEntry = {
      display: string; // "4:00 PM"
      startMinutes: number;
      coaches: CoachSlot[];
    };

    type DayEntry = {
      date: string; // "2026-05-26"
      label: string; // "Mon, May 26"
      times: TimeEntry[];
    };

    // Build a map: dateKey -> startMinutes -> TimeEntry
    const dayMap = new Map<string, Map<number, TimeEntry>>();
    const dayLabels = new Map<string, string>();

    for (const { coach, date, slots } of results) {
      const dateKey = formatPt(fromZonedTime(toZonedTime(date, APP_TZ), APP_TZ), 'yyyy-MM-dd');
      const dayLabel = formatPt(fromZonedTime(toZonedTime(date, APP_TZ), APP_TZ), 'EEE, MMM d');

      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, new Map());
        dayLabels.set(dateKey, dayLabel);
      }
      const timeMap = dayMap.get(dateKey)!;

      for (const slot of slots) {
        // Derive start-of-day minutes in PT for grouping
        const ptSlotDate = toZonedTime(slot.startUTC, APP_TZ);
        const startMinutes = ptSlotDate.getHours() * 60 + ptSlotDate.getMinutes();
        const timeDisplay = formatPt(slot.startUTC, 'h:mm a'); // "4:00 PM"

        if (!timeMap.has(startMinutes)) {
          timeMap.set(startMinutes, {
            display: timeDisplay,
            startMinutes,
            coaches: [],
          });
        }

        timeMap.get(startMinutes)!.coaches.push({
          id: coach.id,
          name: coach.name,
          serviceId: coach.serviceId,
          startUTC: slot.startUTC.toISOString(),
          endUTC: slot.endUTC.toISOString(),
        });
      }
    }

    // Serialise into ordered arrays
    const days: DayEntry[] = [];
    for (const [dateKey, timeMap] of [...dayMap.entries()].sort()) {
      const times: TimeEntry[] = [...timeMap.values()]
        .sort((a, b) => a.startMinutes - b.startMinutes)
        // Sort coaches within each slot alphabetically
        .map((t) => ({
          ...t,
          coaches: [...t.coaches].sort((a, b) => a.name.localeCompare(b.name)),
        }));

      days.push({
        date: dateKey,
        label: dayLabels.get(dateKey)!,
        times,
      });
    }

    const response = NextResponse.json({ ok: true, days });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (err: unknown) {
    console.error('quick-book error:', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to load availability' },
      { status: 500 }
    );
  }
}
