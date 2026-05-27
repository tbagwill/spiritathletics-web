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
      };
    })
    .filter(Boolean) as { id: string; name: string; serviceId: string }[];

  return (
    <div className="space-y-10">
      {/* Quick Book: Day -> Time -> Coach */}
      <QuickBookSection />

      {/* Divider */}
      <div className="relative flex items-center gap-4">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-sm font-medium text-gray-500 bg-gradient-to-br from-slate-50 to-blue-50 px-4 whitespace-nowrap">
          Or search by coach
        </span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* Original coach-first picker */}
      <PrivateLessonPicker coaches={coaches} />
    </div>
  );
}
