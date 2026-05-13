import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { buildICS } from '@/lib/ics';
import { buildCoachHtml, buildCustomerHtml, sendBookingEmails } from '@/lib/email';
import { formatPt } from '@/lib/time';
import { rateLimitHit } from '@/lib/rateLimit';

const BodySchema = z.object({
  classOccurrenceId: z.string().cuid(),
  serviceId: z.string().cuid(),
  customerName: z.string().min(1).max(100).trim(),
  customerEmail: z.string().email().max(255).toLowerCase(),
  athleteNames: z.array(z.string().min(1).max(100).trim()).min(1).max(10),
  notes: z.string().max(1000).optional(),
  paymentMethod: z.enum(['CARD', 'CASH']).optional().default('CARD'),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parse = BodySchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ ok: false, error: 'Invalid input', issues: parse.error.format() }, { status: 400 });
  }
  const { classOccurrenceId, serviceId, customerName, customerEmail, athleteNames, notes, paymentMethod } = parse.data;
  const numAthletes = athleteNames.length;

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const key = `class:${ip}:${customerEmail}`;
  if (!rateLimitHit(key, 5, 60_000)) return NextResponse.json({ ok: false, error: 'Too many requests, please try again shortly.' }, { status: 429 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const occ = await tx.classOccurrence.findUnique({
        where: { id: classOccurrenceId },
        include: {
          classTemplate: { include: { service: { include: { coach: { include: { user: true } } } } } },
        },
      });
      if (!occ || occ.status !== 'SCHEDULED') throw new Error('Occurrence not available');
      const count = await tx.booking.count({ where: { classOccurrenceId, status: 'CONFIRMED' } });
      const spotsLeft = occ.capacity - count;
      if (numAthletes > spotsLeft) throw new Error(`Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining`);

      const service = await tx.service.findUnique({ where: { id: serviceId } });
      if (!service) throw new Error('Service not found');

      const bookings = [];
      for (const athleteName of athleteNames) {
        const cancellationToken = uuidv4();
        const booking = await tx.booking.create({
          data: {
            type: 'CLASS',
            status: 'CONFIRMED',
            customerName,
            customerEmail,
            athleteName,
            notes,
            serviceId,
            classOccurrenceId,
            startDateTimeUTC: occ.startDateTimeUTC,
            endDateTimeUTC: new Date(occ.startDateTimeUTC.getTime() + (service.durationMinutes ?? 60) * 60000),
            priceCents: service.basePriceCents,
            paymentMethod,
            cancellationToken,
            numAthletes: 1,
          },
        });
        bookings.push(booking);
      }
      return { bookings, occ, service };
    });

    const firstBooking = result.bookings[0];
    const coachEmail = result.occ.classTemplate.service.coach?.user?.email || null;
    const coachId = result.occ.classTemplate.service.coachId;
    const settings = coachId ? await prisma.coachSettings.findUnique({ where: { coachId } }).catch(() => null) : null;
    const coachEmails = [coachEmail, ...(settings?.alertEmails || [])];
    const when = formatPt(firstBooking.startDateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
    const location = process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';
    const cancelUrl = `${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net'}/cancel?token=${firstBooking.cancellationToken}`;
    const title = result.service.title;
    const allAthleteNames = athleteNames.join(', ');

    const ics = buildICS({
      uid: firstBooking.id,
      start: firstBooking.startDateTimeUTC,
      end: firstBooking.endDateTimeUTC,
      summary: `${title} — ${result.occ.classTemplate.service.coach?.user?.name ?? 'Coach'}`,
      location,
      description: `Cancel: ${cancelUrl}`,
      organizerEmail: process.env.SENDER_EMAIL || 'booking@spiritathletics.net',
      method: 'REQUEST',
    });

    await sendBookingEmails({
      customerEmail,
      coachEmails,
      subject: `Class Reserved: ${title} (${when})`,
      htmlCustomer: buildCustomerHtml(title, when, location, cancelUrl),
      htmlCoach: buildCoachHtml(title, when, customerName, allAthleteNames),
      icsContent: ics,
    });

    return NextResponse.json({ ok: true, bookingIds: result.bookings.map((b) => b.id) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? 'Booking failed' }, { status: 400 });
  }
}
