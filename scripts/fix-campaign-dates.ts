import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCampaignDates() {
  console.log('🔧 Setting campaign dates: August 14-21, 2025...');
  
  // August 14th, 2025 (yesterday) - start of day
  const campaignStart = new Date('2025-08-14T00:00:00Z');
  // August 21st, 2025 (next Friday) - end of day  
  const campaignEnd = new Date('2025-08-21T23:59:59Z');
  
  const now = new Date();
  console.log(`Current time: ${now.toISOString()}`);
  console.log(`Setting start: ${campaignStart.toISOString()} (Aug 14)`);
  console.log(`Setting end:   ${campaignEnd.toISOString()} (Aug 21)`);
  
  const updatedCampaign = await prisma.shopCampaign.update({
    where: { slug: 'spring-2025-collection' },
    data: {
      title: 'Spirit Athletics August 2025 Pop-Up',
      startsAt: campaignStart,
      endsAt: campaignEnd,
      status: 'ACTIVE'
    }
  });
  
  console.log(`✅ Updated campaign: ${updatedCampaign.title}`);
  console.log('🛍️ Campaign is now active! Visit http://localhost:3000/shop');
}

fixCampaignDates()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
