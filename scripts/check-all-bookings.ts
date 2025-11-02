import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllBookings() {
  console.log('Checking ALL bookings (including past)...\n');

  const allBookings = await prisma.booking.findMany({
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
    take: 10,
  });

  console.log(`Total bookings (last 10): ${allBookings.length}\n`);

  if (allBookings.length > 0) {
    allBookings.forEach((booking, idx) => {
      console.log(`\n${idx + 1}. Booking ID: ${booking.id}`);
      console.log(`   Customer: ${booking.customerName} (${booking.customerEmail})`);
      console.log(`   Athlete: ${booking.athleteName}`);
      console.log(`   Type: ${booking.type}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Start: ${booking.startDateTimeUTC.toISOString()}`);
      console.log(`   Created: ${booking.createdAt.toISOString()}`);
      console.log(`   Coach ID: ${booking.coachId || 'N/A'}`);
      console.log(`   Service Coach ID: ${booking.service.coachId || 'N/A'}`);
      if (booking.service.coach?.user) {
        console.log(`   Coach: ${booking.service.coach.user.name} (${booking.service.coach.user.email})`);
      }
      
      const now = new Date();
      const isPast = new Date(booking.startDateTimeUTC) < now;
      console.log(`   Time status: ${isPast ? 'PAST' : 'FUTURE'}`);
    });
  } else {
    console.log('⚠️  No bookings found at all!');
  }

  await prisma.$disconnect();
}

checkAllBookings().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});

