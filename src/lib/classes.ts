import { prisma } from '@/lib/prisma';
import { addWeeks, eachWeekOfInterval, isAfter, isBefore } from 'date-fns';
import { combineLocalDateAndMinutesPT } from './time';

export async function generateOccurrencesNextWeeks(weeks = 8): Promise<number> {
  const templates = await prisma.classTemplate.findMany({
    where: { isActive: true },
    include: { service: true },
  });
  const now = new Date();
  const defaultEnd = addWeeks(now, weeks);
  let createdOrUpserted = 0;

  for (const tpl of templates) {
    // Clamp generation window: start = max(now, tpl.startDate), end = min(defaultEnd, tpl.endDate)
    const windowStart = tpl.startDate && isAfter(tpl.startDate, now) ? tpl.startDate : now;
    const windowEnd = tpl.endDate && isBefore(tpl.endDate, defaultEnd) ? tpl.endDate : defaultEnd;

    if (isAfter(windowStart, windowEnd)) continue; // template's date range is entirely in the past or future

    // Iterate each week, find the day corresponding to tpl.weekday in PT
    const isoWeekStarts = eachWeekOfInterval({ start: windowStart, end: windowEnd });
    for (const wkStart of isoWeekStarts) {
      const ptDate = toWeekday(wkStart, tpl.weekday);
      const startUTC = combineLocalDateAndMinutesPT(ptDate, tpl.startTimeMinutes);

      // Skip occurrences outside the template's date range
      if (tpl.startDate && isBefore(startUTC, tpl.startDate)) continue;
      if (tpl.endDate && isAfter(startUTC, tpl.endDate)) continue;

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

function toWeekday(weekStart: Date, weekday: number): Date {
  const d = new Date(weekStart);
  // weekStart is Sunday if locale default; ensure we set to desired weekday
  const current = d.getDay();
  const diff = (weekday - current + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
} 