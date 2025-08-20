import { PrismaClient, ServiceType, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertUser(email: string, name: string, role: UserRole, passwordPlain?: string) {
  const passwordHash = passwordPlain ? await hash(passwordPlain, 10) : undefined;
  return prisma.user.upsert({
    where: { email },
    update: { name, role, ...(passwordHash ? { passwordHash } : {}) },
    create: { email, name, role, ...(passwordHash ? { passwordHash } : {}) },
  });
}

async function main() {
  // Admin user (no password by default)
  await upsertUser('admin@spiritathletics.net', 'Admin', UserRole.ADMIN);

  // Coaches with specialties (using real emails where available)
  const coachesData = [
    { name: 'Angel', email: 'anmcheer5300.am@gmail.com', specialties: ['Privates','Flight','Tumbling'] },
    { name: 'Danielle', email: 'dandelion88@verizon.net', specialties: ['Privates','Tumbling'] },
    { name: 'Aliszia', email: 'alisziaorland@gmail.com', specialties: ['Privates','Flexibility','Tumbling'] },
    { name: 'Bethany', email: 'bsnow429@gmail.com', specialties: ['Privates','Tumbling'] },
    { name: 'Jessica', email: 'jessicaamber821@gmail.com', specialties: ['Privates','Tumbling'] },
  ];

  const coaches = [] as { userId: string; profileId: string; name: string }[];

  for (const c of coachesData) {
    const user = await upsertUser(c.email, c.name, UserRole.COACH);
    const profile = await prisma.coachProfile.upsert({
      where: { userId: user.id },
      update: { isActive: true, specialties: c.specialties },
      create: { userId: user.id, isActive: true, specialties: c.specialties },
    });
    await (prisma as any).coachSettings.upsert({
      where: { coachId: profile.id },
      update: {},
      create: { coachId: profile.id, mustApproveRequests: false, alertEmails: [] },
    });
    coaches.push({ userId: user.id, profileId: profile.id, name: c.name });

    await prisma.service.upsert({
      where: { id: `${profile.id}_private` },
      update: {},
      create: {
        id: `${profile.id}_private`,
        coachId: profile.id,
        type: ServiceType.PRIVATE,
        title: 'Private Lesson',
        description: 'One-on-one skill development.',
        basePriceCents: 0,
        isActive: true,
      },
    });
  }

  // Coach Tyler (external login email) with credential
  const tylerLogin = await upsertUser('tyler.bagwill@gmail.com', 'Tyler', UserRole.COACH, 'SpiritCoach123!');
  const tylerProfile = await prisma.coachProfile.upsert({
    where: { userId: tylerLogin.id },
    update: { isActive: true, specialties: ['Privates','Flight'] },
    create: { userId: tylerLogin.id, isActive: true, specialties: ['Privates','Flight'] },
  });
  await prisma.service.upsert({
    where: { id: `${tylerProfile.id}_private` },
    update: {},
    create: {
      id: `${tylerProfile.id}_private`,
      coachId: tylerProfile.id,
      type: ServiceType.PRIVATE,
      title: 'Private Lesson',
      description: 'One-on-one skill development.',
      basePriceCents: 0,
      isActive: true,
    },
  });
  await (prisma as any).coachSettings.upsert({
    where: { coachId: tylerProfile.id },
    update: {},
    create: { coachId: tylerProfile.id, mustApproveRequests: false, alertEmails: [] },
  });

  // Class services (Aliszia)
  const aliszia = coaches.find(c => c.name === 'Aliszia');
  if (!aliszia) throw new Error('Aliszia coach not found');

  const tumblingService = await prisma.service.upsert({
    where: { id: `${aliszia.profileId}_class_tumbling1` },
    update: {},
    create: {
      id: `${aliszia.profileId}_class_tumbling1`,
      coachId: aliszia.profileId,
      type: ServiceType.CLASS,
      title: 'Tumbling Class - Level 1',
      description: 'Beginner tumbling class. Basic tumbling skills.',
      durationMinutes: 60,
      basePriceCents: 3000,
      isActive: true,
    },
  });

  const flexibilityService = await prisma.service.upsert({
    where: { id: `${aliszia.profileId}_class_flexibility` },
    update: {},
    create: {
      id: `${aliszia.profileId}_class_flexibility`,
      coachId: aliszia.profileId,
      type: ServiceType.CLASS,
      title: 'Flexibility Improvement & Element Critiques',
      description: 'Advanced stretching and mobility. Flyer element critiques and coaching.',
      durationMinutes: 60,
      basePriceCents: 3000,
      isActive: true,
    },
  });

  const mondayWeekday = 1; // Monday
  const startTimeMinutes = 16 * 60; // 4:00 PM local PT
  const capacity = 10;

  await prisma.classTemplate.upsert({
    where: { id: `${tumblingService.id}_template` },
    update: { isActive: true },
    create: {
      id: `${tumblingService.id}_template`,
      serviceId: tumblingService.id,
      weekday: mondayWeekday,
      startTimeMinutes,
      capacity,
      isActive: true,
    },
  });

  await prisma.classTemplate.upsert({
    where: { id: `${flexibilityService.id}_template` },
    update: { isActive: true },
    create: {
      id: `${flexibilityService.id}_template`,
      serviceId: flexibilityService.id,
      weekday: mondayWeekday,
      startTimeMinutes,
      capacity,
      isActive: true,
    },
  });

  await prisma.cancellationPolicy.upsert({
    where: { id: 'default_policy' },
    update: { minHoursNotice: 4 },
    create: { id: 'default_policy', minHoursNotice: 4 },
  });

  // Additional coaches from provided list (removing duplicates)
  const extraCoaches: { name: string; email: string }[] = [
    { name: 'Brooklyn', email: 'bmccurry2008@gmail.com' },
    { name: 'Rhyan', email: 'rhyancollier23@gmail.com' },
    { name: 'Candice Vargas', email: 'candicem.vargas@gmail.com' },
    { name: 'Isabel', email: 'isabelevargas.06@icloud.com' },
    { name: 'Bryn', email: 'brynmoses1718@gmail.com' },
    { name: 'Natalie', email: 'natalieee7688@gmail.com' },
    { name: 'Kimmy', email: 'kim879@icloud.com' },
  ];
  for (const ec of extraCoaches) {
    const u = await upsertUser(ec.email.toLowerCase(), ec.name, UserRole.COACH);
    const p = await prisma.coachProfile.upsert({
      where: { userId: u.id },
      update: { isActive: true, specialties: ['Privates','Tumbling'] },
      create: { userId: u.id, isActive: true, specialties: ['Privates','Tumbling'] },
    });
    await prisma.service.upsert({
      where: { id: `${p.id}_private` },
      update: {},
      create: {
        id: `${p.id}_private`,
        coachId: p.id,
        type: ServiceType.PRIVATE,
        title: 'Private Lesson',
        description: 'One-on-one skill development.',
        basePriceCents: 0,
        isActive: true,
      },
    });
    await (prisma as any).coachSettings.upsert({
      where: { coachId: p.id },
      update: {},
      create: { coachId: p.id, mustApproveRequests: false, alertEmails: [] },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 