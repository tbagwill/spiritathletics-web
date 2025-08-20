import { prisma } from '@/lib/prisma';
import ClassListClient from './ClassListClient';

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

  // Convert Date objects to strings for client component
  const serializedOccurrences = occurrences.map(occ => ({
    ...occ,
    startDateTimeUTC: occ.startDateTimeUTC.toISOString(),
  }));

  return <ClassListClient occurrences={serializedOccurrences} />;
} 