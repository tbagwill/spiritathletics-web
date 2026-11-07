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
    <section id="clinics" className="mb-14 scroll-mt-24">
      {/* Section header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-spirit">Special events</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Clinics</h2>
          <p className="mt-1 text-sm text-slate-500">Limited spots. Register to secure your place.</p>
        </div>
        <span className="rounded-full bg-spirit-50 px-3 py-1 text-xs font-semibold text-spirit ring-1 ring-inset ring-spirit-400/30">
          {clinics.length} upcoming
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinics.map((clinic) => (
          <ClinicCard key={clinic.id} clinic={clinic} />
        ))}
      </div>
    </section>
  );
}
