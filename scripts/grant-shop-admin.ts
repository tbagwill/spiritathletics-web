import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function grantShopAdmin() {
  console.log('🔐 Granting shop admin permissions...');
  
  // Grant Tyler shop admin access
  const tylerUser = await prisma.user.findUnique({
    where: { email: 'tyler.bagwill@gmail.com' },
    include: { coachProfile: { include: { settings: true } } }
  });
  
  if (tylerUser?.coachProfile) {
    await prisma.coachSettings.update({
      where: { coachId: tylerUser.coachProfile.id },
      data: { canManageShop: true }
    });
    console.log('✅ Tyler granted shop admin access');
  } else {
    console.log('❌ Tyler coach profile not found');
  }
  
  // Note: We'll grant Patti access once her coach profile is set up
  console.log('📝 Note: Grant Patti shop admin access once her profile is created');
  
  // List current shop admins
  const shopAdmins = await prisma.coachSettings.findMany({
    where: { canManageShop: true },
    include: { coach: { include: { user: true } } }
  });
  
  console.log('\n👥 Current shop administrators:');
  for (const admin of shopAdmins) {
    console.log(`   - ${admin.coach.user.name} (${admin.coach.user.email})`);
  }
}

grantShopAdmin()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
