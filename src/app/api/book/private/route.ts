import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { computePrivatePrice } from '@/lib/pricing';
import { buildICS } from '@/lib/ics';
import { buildCoachHtml, buildCustomerHtml, sendBookingEmails } from '@/lib/email';
import { formatPt } from '@/lib/time';

import { rateLimitHit } from '@/lib/rateLimit';

const BodySchema = z.object({
  coachId: z.string().cuid(),
  serviceId: z.string().cuid(),
  startDateTimeUTC: z.string().transform((s) => new Date(s)),
  endDateTimeUTC: z.string().transform((s) => new Date(s)),
  customerName: z.string().min(1).max(100).trim(),
  customerEmail: z.string().email().max(255).toLowerCase(),
  athleteName: z.string().min(1).max(100).trim(),

  selection: z.union([
    z.object({ kind: z.literal('SOLO'), duration: z.literal(30) }),
    z.object({ kind: z.literal('SOLO'), duration: z.literal(45) }),
    z.object({ kind: z.literal('SOLO'), duration: z.literal(60) }),
    z.object({ kind: z.literal('SEMI_PRIVATE'), duration: z.literal(60) }),
  ]),

});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parse = BodySchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ ok: false, error: 'Invalid input', issues: parse.error.format() }, { status: 400 });
  }
  const { coachId, serviceId, startDateTimeUTC, endDateTimeUTC, customerName, customerEmail, athleteName, selection } = parse.data;

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const key = `private:${ip}:${customerEmail}`;
  if (!rateLimitHit(key, 5, 60_000)) return NextResponse.json({ ok: false, error: 'Too many requests, please try again shortly.' }, { status: 429 });



  try {
    const result = await prisma.$transaction(async (tx) => {
      // Comprehensive overlap check using safe Prisma query
      // This checks for ANY booking that would conflict with the requested time slot
      const startUTC = new Date(startDateTimeUTC);
      const endUTC = new Date(endDateTimeUTC);
      
      const overlapCount = await tx.booking.count({
        where: {
          coachId,
          status: 'CONFIRMED',
          OR: [
            // Case 1: Existing booking starts before our slot and ends after our start time
            {
              AND: [
                { startDateTimeUTC: { lt: startUTC } },
                { endDateTimeUTC: { gt: startUTC } }
              ]
            },
            // Case 2: Existing booking starts before our end time and ends after our end time  
            {
              AND: [
                { startDateTimeUTC: { lt: endUTC } },
                { endDateTimeUTC: { gt: endUTC } }
              ]
            },
            // Case 3: Existing booking is completely within our slot
            {
              AND: [
                { startDateTimeUTC: { gte: startUTC } },
                { endDateTimeUTC: { lte: endUTC } }
              ]
            },
            // Case 4: Our slot is completely within existing booking
            {
              AND: [
                { startDateTimeUTC: { lte: startUTC } },
                { endDateTimeUTC: { gte: endUTC } }
              ]
            }
          ]
        }
      });
      
      if (overlapCount > 0) {
        // Log the conflict for debugging
        console.log(`❌ Booking conflict detected for coach ${coachId} at ${startUTC.toISOString()} - ${endUTC.toISOString()}`);
        throw new Error('Time slot no longer available - scheduling conflict detected');
      }

      const service = await tx.service.findUnique({ where: { id: serviceId }, include: { coach: { include: { user: true } } } });
      if (!service || service.type !== 'PRIVATE') throw new Error('Service not found');
      if (service.coachId !== coachId) throw new Error('Coach and service mismatch');

      const pricing = computePrivatePrice(selection as any);
      const cancellationToken = uuidv4();
      const booking = await tx.booking.create({
        data: {
          type: 'PRIVATE',
          status: 'CONFIRMED',
          privateKind: pricing.privateKind as any,
          numAthletes: pricing.numAthletes,
          customerName,
          customerEmail,
          athleteName,
          coachId,
          serviceId,
          startDateTimeUTC,
          endDateTimeUTC,
          priceCents: pricing.priceCents,
          perAthletePriceCents: pricing.perAthletePriceCents,
          cancellationToken,
        },
      });
      return { booking, service };
    });

    const coachEmail = result.service.coach?.user?.email || null;
    const settings = await prisma.coachSettings.findUnique({ where: { coachId: result.service.coachId! } }).catch(() => null);
    const coachEmails = (settings?.emailBookingConfirmed === false) ? [] : [coachEmail, ...(settings?.alertEmails || [])];
    const coachName = result.service.coach?.user?.name || 'Coach';
    const title = 'Private Lesson';
    const when = formatPt(result.booking.startDateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
    const location = process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';
    const cancelUrl = `${process.env.BASE_PROD_URL || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net'}/cancel?token=${result.booking.cancellationToken}`;

    const ics = buildICS({
      uid: result.booking.id,
      start: result.booking.startDateTimeUTC,
      end: result.booking.endDateTimeUTC,
      summary: `${title} — ${coachName}`,
      location,
      description: `Cancel: ${cancelUrl}`,
      organizerEmail: process.env.SENDER_EMAIL || 'booking@spiritathletics.net',
      method: 'REQUEST',
    });

    await sendBookingEmails({
      customerEmail,
      coachEmails,
      subject: `Booking Confirmed: ${title} (${when})`,
      htmlCustomer: buildCustomerHtml(title, when, location, cancelUrl),
      htmlCoach: buildCoachHtml(title, when, customerName, athleteName),
      icsContent: ics,
    });

    return NextResponse.json({ ok: true, bookingId: (result as any).booking.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message ?? 'Booking failed' }, { status: 400 });
  }
} 