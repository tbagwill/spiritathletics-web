import { prisma } from '@/lib/prisma';
import PrivateLessonPicker from './PrivateLessonPicker';

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

  return <PrivateLessonPicker coaches={coaches} />;
} 