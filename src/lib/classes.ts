import { prisma } from '@/lib/prisma';
import { addDays, addWeeks, eachWeekOfInterval, isAfter, isBefore } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { APP_TZ, combineLocalDateAndMinutesPT, ptDateString } from './time';

export async function generateOccurrencesNextWeeks(weeks = 8): Promise<number> {
  const templates = await prisma.classTemplate.findMany({
    where: { isActive: true },
    include: { service: true },
  });
  const now = new Date();
  const defaultEnd = addWeeks(now, weeks);
  let createdOrUpserted = 0;

  for (const tpl of templates) {
    // Clamp generation window: start = max(now, tpl.startDate), end = min(defaultEnd, tpl.endDate).
    // For endDate, extend the iteration window by 1 day so eachWeekOfInterval includes the week
    // that contains the end date. The precise inclusive/exclusive boundary is enforced below using
    // PT calendar-date string comparisons.
    const windowStart = tpl.startDate && isAfter(tpl.startDate, now) ? tpl.startDate : now;
    const rawEnd = tpl.endDate && isBefore(tpl.endDate, defaultEnd) ? tpl.endDate : defaultEnd;
    const windowEnd = tpl.endDate ? addDays(rawEnd, 1) : rawEnd;

    if (isAfter(windowStart, windowEnd)) continue;

    // Pre-compute the intended PT calendar boundary strings from stored UTC-midnight values.
    // new Date("YYYY-MM-DD") stores UTC midnight; its UTC date string equals the intended day.
    const startBound = tpl.startDate ? tpl.startDate.toISOString().slice(0, 10) : null;
    const endBound = tpl.endDate ? tpl.endDate.toISOString().slice(0, 10) : null;

    // Iterate each week, find the day corresponding to tpl.weekday in PT
    const isoWeekStarts = eachWeekOfInterval({ start: windowStart, end: windowEnd });
    for (const wkStart of isoWeekStarts) {
      const ptDate = toWeekday(wkStart, tpl.weekday);
      const startUTC = combineLocalDateAndMinutesPT(ptDate, tpl.startTimeMinutes);

      // Inclusive PT-calendar-date boundary check: compare the occurrence's PT date against the
      // stored boundary strings. This makes endDate inclusive of the full PT calendar day.
      const occDateStr = ptDateString(startUTC);
      if (startBound && occDateStr < startBound) continue;
      if (endBound && occDateStr > endBound) continue;

      await prisma.classOccurrence.upsert({
        where: { classTemplateId_startDateTimeUTC: { classTemplateId: tpl.id, startDateTimeUTC: startUTC } },
        update: { capacity: tpl.capacity },
        create: {
          classTemplateId: tpl.id,
          startDateTimeUTC: startUTC,
          capacity: tpl.capacity,
          status: 'SCHEDULED',
        },
      });
      createdOrUpserted++;
    }
  }
  return createdOrUpserted;
}

/**
 * Given any instant within a week, returns an instant whose **Pacific-time
 * calendar date** falls on the requested weekday (0 = Sunday ... 6 = Saturday)
 * within that same PT week.
 *
 * This must be computed in PT — not the server's local timezone — because the
 * generated date is later interpreted as a PT calendar date by
 * combineLocalDateAndMinutesPT. On a UTC server (e.g. Vercel), using the local
 * weekday would shift every occurrence back by one day (Tue -> Mon).
 */
function toWeekday(weekStart: Date, weekday: number): Date {
  // PT weekday of the reference instant. 'i' is ISO day-of-week (1 = Mon ... 7 = Sun).
  // `% 7` maps it to 0 = Sun ... 6 = Sat to match the stored weekday convention.
  const ptDow = Number(formatInTimeZone(weekStart, APP_TZ, 'i')) % 7;
  const diff = (weekday - ptDow + 7) % 7;

  // PT calendar date (Y/M/D) of the reference instant.
  const ptYmd = formatInTimeZone(weekStart, APP_TZ, 'yyyy-MM-dd');
  const [y, m, d] = ptYmd.split('-').map(Number);

  // Build an instant at noon UTC on the target calendar day. Noon UTC is always
  // the same calendar date in PT (PT is UTC-7/-8), so combineLocalDateAndMinutesPT
  // will read the correct PT date. JS Date normalizes month/day overflow.
  return new Date(Date.UTC(y, m - 1, d + diff, 12, 0, 0, 0));
} 