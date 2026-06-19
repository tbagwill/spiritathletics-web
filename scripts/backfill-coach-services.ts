/**
 * One-time backfill: creates a PRIVATE Service for every active CoachProfile
 * that was added via the dashboard and is missing one.
 *
 * Run with:  npx tsx scripts/backfill-coach-services.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find all active coach profiles
  const profiles = await prisma.coachProfile.findMany({
    where: { isActive: true },
    include: {
      user: { select: { name: true, email: true } },
      services: { where: { type: 'PRIVATE' } },
    },
  });

  let created = 0;
  let skipped = 0;

  for (const profile of profiles) {
    if (profile.services.length > 0) {
      console.log(`  [skip]    ${profile.user?.name ?? profile.id} — already has PRIVATE service`);
      skipped++;
      continue;
    }

    await prisma.service.create({
      data: {
        coachId: profile.id,
        type: 'PRIVATE',
        title: 'Private Lesson',
        description: 'One-on-one skill development.',
        basePriceCents: 0,
        isActive: true,
      },
    });

    console.log(`  [created] ${profile.user?.name ?? profile.id} (${profile.user?.email}) — PRIVATE service added`);
    created++;
  }

  console.log(`\nDone. Created: ${created}  Skipped (already had service): ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
