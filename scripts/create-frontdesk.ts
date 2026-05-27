import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('SpiritOffice123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'frontdesk@spiritathletics.net' },
    update: { name: 'Front Desk', role: UserRole.ADMIN, passwordHash },
    create: { email: 'frontdesk@spiritathletics.net', name: 'Front Desk', role: UserRole.ADMIN, passwordHash },
  });

  console.log(`Front desk account ready: ${user.email} (role: ${user.role}, id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error('Failed to create front desk account:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
