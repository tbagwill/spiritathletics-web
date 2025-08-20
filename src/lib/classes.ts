import { prisma } from '@/lib/prisma';
import { addWeeks, eachWeekOfInterval } from 'date-fns';
import { combineLocalDateAndMinutesPT } from './time';

export async function generateOccurrencesNextWeeks(weeks = 8): Promise<number> {
  const templates = await prisma.classTemplate.findMany({
    where: { isActive: true },
    include: { service: true },
  });
  const now = new Date();
  const end = addWeeks(now, weeks);
  let createdOrUpserted = 0;

  for (const tpl of templates) {
    // Iterate each week, find the day corresponding to tpl.weekday in PT
    const isoWeekStarts = eachWeekOfInterval({ start: now, end });
    for (const wkStart of isoWeekStarts) {
      const ptDate = toWeekday(wkStart, tpl.weekday);
      const startUTC = combineLocalDateAndMinutesPT(ptDate, tpl.startTimeMinutes);
      await prisma.classOccurrence.upsert({
        where: { classTemplateId_startDateTimeUTC: { classTemplateId: tpl.id, startDateTimeUTC: startUTC } },
        update: { capacity: 10 },
        create: {
          classTemplateId: tpl.id,
          startDateTimeUTC: startUTC,
          capacity: 10,
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