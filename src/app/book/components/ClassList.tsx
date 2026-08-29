import { prisma } from '@/lib/prisma';
import ClassListClient from './ClassListClient';
import { ptDateString } from '@/lib/time';

export default async function ClassList() {
  const now = new Date();
  const inTwoWeeks = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

  const occurrences = await prisma.classOccurrence.findMany({
    where: {
      status: 'SCHEDULED',
      startDateTimeUTC: { gte: now, lte: inTwoWeeks },
    },
    orderBy: { startDateTimeUTC: 'asc' },
    include: {
      classTemplate: {
        include: {
          service: {
            include: { coach: { include: { user: true } } },
          },
        },
      },
      bookings: {
        where: { status: 'CONFIRMED' },
        select: { id: true },
      },
    },
  });

  const inBounds = occurrences.filter((occ) => {
    const occDate = ptDateString(occ.startDateTimeUTC);
    const startBound = occ.classTemplate.startDate
      ? occ.classTemplate.startDate.toISOString().slice(0, 10)
      : null;
    const endBound = occ.classTemplate.endDate
      ? occ.classTemplate.endDate.toISOString().slice(0, 10)
      : null;
    if (startBound && occDate < startBound) return false;
    if (endBound && occDate > endBound) return false;
    return true;
  });

  // Convert Date objects to strings for client component
  const serializedOccurrences = inBounds.map(occ => ({
    ...occ,
    startDateTimeUTC: occ.startDateTimeUTC.toISOString(),
  }));

  return <ClassListClient occurrences={serializedOccurrences} />;
} 