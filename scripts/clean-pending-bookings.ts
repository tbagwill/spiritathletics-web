import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanPendingBookings() {
  console.log('🧹 Cleaning up PENDING bookings...\n');

  // First, show what we're about to delete
  const pendingBookings = await prisma.booking.findMany({
    where: { status: 'PENDING' },
    include: {
      service: {
        include: {
          coach: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (pendingBookings.length === 0) {
    console.log('✅ No pending bookings to clean up!');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${pendingBookings.length} pending booking(s):\n`);
  
  pendingBookings.forEach((booking, idx) => {
    console.log(`${idx + 1}. ${booking.customerName} (${booking.customerEmail})`);
    console.log(`   Athlete: ${booking.athleteName}`);
    console.log(`   Start: ${booking.startDateTimeUTC.toISOString()}`);
    console.log(`   Coach: ${booking.service.coach?.user?.name || 'N/A'}`);
    console.log('');
  });

  // Delete them
  const result = await prisma.booking.deleteMany({
    where: { status: 'PENDING' },
  });

  console.log(`✅ Deleted ${result.count} pending booking(s)`);
  console.log('\nDatabase cleaned! Ready for fresh testing. 🎉');

  await prisma.$disconnect();
}

cleanPendingBookings().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});

