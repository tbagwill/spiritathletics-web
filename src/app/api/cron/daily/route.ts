import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import {
  buildCoachDailyAgendaHtml,
  buildClientReminderHtml,
  type AgendaBooking,
} from '@/lib/email';
import { formatPt, utcToPt } from '@/lib/time';
import { startOfDay, endOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SENDER = process.env.SENDER_EMAIL || 'booking@spiritathletics.net';
const APP_TZ = 'America/Los_Angeles';

/**
 * Vercel Cron handler — scheduled at 0 15 * * * (UTC) ≈ 8 AM PT.
 * Authenticated via Authorization: Bearer <CRON_SECRET> (set in Vercel env + vercel.json).
 */
export async function GET(req: NextRequest) {
  // Authenticate: Vercel sends Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Determine today's date window in PT
  const nowUtc = new Date();
  const nowPt = toZonedTime(nowUtc, APP_TZ);
  const todayStartPt = startOfDay(nowPt);
  const todayEndPt = endOfDay(nowPt);
  const todayStartUtc = fromZonedTime(todayStartPt, APP_TZ);
  const todayEndUtc = fromZonedTime(todayEndPt, APP_TZ);
  const dateLabel = formatPt(nowUtc, 'EEEE, MMMM d');

  let coachEmailsSent = 0;
  let clientRemindersSent = 0;
  const errors: string[] = [];

  // ── 1. Daily agenda emails for coaches ────────────────────────────────────
  const coaches = await prisma.coachProfile.findMany({
    where: { isActive: true, settings: { dailyAgendaEmail: true } },
    include: {
      user: true,
      settings: true,
      bookings: {
        where: {
          status: 'CONFIRMED',
          startDateTimeUTC: { gte: todayStartUtc, lte: todayEndUtc },
        },
        include: { service: true },
        orderBy: { startDateTimeUTC: 'asc' },
      },
    },
  });

  for (const coach of coaches) {
    try {
      const agendaItems: AgendaBooking[] = coach.bookings.map((b) => ({
        type: b.type,
        title: b.isManualBlock ? 'Reserved Slot' : (b.type === 'CLASS' ? b.service.title : 'Private Lesson'),
        when: formatPt(b.startDateTimeUTC, "h:mm a 'PT'"),
        customerName: b.customerName,
        athleteName: b.athleteName,
        priceCents: b.priceCents,
        paymentMethod: b.paymentMethod,
        isManualBlock: b.isManualBlock,
      }));

      const html = buildCoachDailyAgendaHtml(coach.user.name ?? 'Coach', dateLabel, agendaItems);

      const recipients = [coach.user.email, ...(coach.settings?.alertEmails ?? [])].filter(Boolean);
      if (recipients.length === 0) continue;

      await resend.emails.send({
        from: `Spirit Athletics <${SENDER}>`,
        to: recipients as string[],
        subject: `Your schedule for ${dateLabel}`,
        html,
      });
      coachEmailsSent++;
    } catch (err: any) {
      errors.push(`Coach ${coach.id}: ${err.message}`);
    }
  }

  // ── 2. Client reminder emails for today's bookings ────────────────────────
  const todayBookings = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      isManualBlock: false,
      reminderSentAt: null,
      startDateTimeUTC: { gte: todayStartUtc, lte: todayEndUtc },
    },
    include: { service: true },
    orderBy: { startDateTimeUTC: 'asc' },
  });

  const location = process.env.ORG_ADDRESS || 'Spirit Athletics';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';

  for (const booking of todayBookings) {
    try {
      const isClass = !!booking.classOccurrenceId;
      const title = isClass ? booking.service.title : 'Private Lesson';
      const when = formatPt(booking.startDateTimeUTC, "h:mm a 'PT'");
      const cancelUrl = `${baseUrl}/cancel?token=${booking.cancellationToken}`;

      const html = buildClientReminderHtml(title, when, location, cancelUrl);

      await resend.emails.send({
        from: `Spirit Athletics <${SENDER}>`,
        to: [booking.customerEmail],
        subject: `Reminder: ${title} today at ${when}`,
        html,
      });

      // Stamp to prevent duplicate reminders
      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSentAt: new Date() },
      });
      clientRemindersSent++;
    } catch (err: any) {
      errors.push(`Booking ${booking.id}: ${err.message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    date: dateLabel,
    coachEmailsSent,
    clientRemindersSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
