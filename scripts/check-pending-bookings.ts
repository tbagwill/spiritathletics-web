import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPendingBookings() {
  console.log('Checking for pending bookings...\n');

  // Get all bookings
  const allBookings = await prisma.booking.findMany({
    where: {
      startDateTimeUTC: { gte: new Date() },
    },
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
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  console.log(`Total upcoming bookings: ${allBookings.length}\n`);

  // Group by status
  const byStatus = allBookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Bookings by status:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Show pending bookings details
  const pendingBookings = allBookings.filter((b) => b.status === 'PENDING');
  
  if (pendingBookings.length > 0) {
    console.log('\n=== PENDING BOOKINGS ===');
    pendingBookings.forEach((booking, idx) => {
      console.log(`\n${idx + 1}. Booking ID: ${booking.id}`);
      console.log(`   Customer: ${booking.customerName} (${booking.customerEmail})`);
      console.log(`   Athlete: ${booking.athleteName}`);
      console.log(`   Type: ${booking.type}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Start: ${booking.startDateTimeUTC.toISOString()}`);
      console.log(`   Coach ID: ${booking.coachId || 'N/A'}`);
      console.log(`   Service ID: ${booking.serviceId}`);
      console.log(`   Service Coach ID: ${booking.service.coachId || 'N/A'}`);
      if (booking.service.coach?.user) {
        console.log(`   Coach Name: ${booking.service.coach.user.name}`);
        console.log(`   Coach Email: ${booking.service.coach.user.email}`);
      }
    });
  } else {
    console.log('\n⚠️  No pending bookings found!');
  }

  // Show all coaches
  console.log('\n=== ALL COACHES ===');
  const coaches = await prisma.coachProfile.findMany({
    include: {
      user: true,
    },
  });

  coaches.forEach((coach, idx) => {
    console.log(`\n${idx + 1}. Coach Profile ID: ${coach.id}`);
    console.log(`   User ID: ${coach.userId}`);
    console.log(`   Name: ${coach.user.name}`);
    console.log(`   Email: ${coach.user.email}`);
  });

  await prisma.$disconnect();
}

checkPendingBookings().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});

