import { prisma } from '@/lib/prisma';
import PrivateLessonPicker from './PrivateLessonPicker';
import QuickBookSection from './QuickBookSection';

export default async function PrivateLessonsSection() {
  const profiles = await prisma.coachProfile.findMany({
    where: {
      isActive: true,
      services: { some: { type: 'PRIVATE', isActive: true } },
    },
    include: {
      user: true,
      services: true,
    },
    orderBy: { user: { name: 'asc' } },
  });

  const coaches = profiles
    .map((p) => {
      const privateService = p.services.find((s) => s.type === 'PRIVATE' && s.isActive);
      if (!privateService) return null;
      return {
        id: p.id,
        name: p.user?.name || 'Coach',
        serviceId: privateService.id,
        specialties: p.specialties,
      };
    })
    .filter(Boolean) as { id: string; name: string; serviceId: string; specialties: string[] }[];

  return (
    <div className="space-y-8">
      {/* Quick Book: Day -> Time -> Coach */}
      <QuickBookSection />

      {/* Divider */}
      <div className="relative flex items-center gap-4 py-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-slate-300" />
        <span className="whitespace-nowrap rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-soft ring-1 ring-slate-200">
          Or search by coach
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300 to-slate-300" />
      </div>

      {/* Original coach-first picker */}
      <PrivateLessonPicker coaches={coaches} />
    </div>
  );
}
