import { prisma } from '@/lib/prisma';
import ClinicCard from './ClinicCard';

export default async function ClinicsSection() {
  const now = new Date();

  const clinicsRaw = await prisma.clinic.findMany({
    where: {
      isActive: true,
      endDateTimeUTC: { gte: now },
    },
    orderBy: { dateTimeUTC: 'asc' },
    include: {
      registrations: {
        where: { status: 'CONFIRMED' },
        select: { id: true, athleteFirstName: true },
      },
    },
  });

  if (clinicsRaw.length === 0) return null;

  // Serialize Date objects to ISO strings for client components
  const clinics = clinicsRaw.map((c) => ({
    ...c,
    dateTimeUTC: c.dateTimeUTC.toISOString(),
    endDateTimeUTC: c.endDateTimeUTC.toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Special Events &amp; Clinics</h2>
            <p className="text-sm text-gray-500">Limited spots — register to secure your place</p>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full shadow-sm">
            {clinics.length} upcoming
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.map((clinic) => (
          <ClinicCard key={clinic.id} clinic={clinic} />
        ))}
      </div>
    </section>
  );
}
