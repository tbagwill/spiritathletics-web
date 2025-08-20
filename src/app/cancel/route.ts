import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildICS } from '@/lib/ics';
import { Resend } from 'resend';
import { rateLimitHit } from '@/lib/rateLimit';
import { logSecurityEvent } from '@/lib/auditLog';

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.SENDER_EMAIL || 'booking@spiritathletics.net';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  
  if (!token) return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
  
  // Rate limit cancellation attempts to prevent token enumeration
  const key = `cancel:${ip}`;
  if (!rateLimitHit(key, 10, 60_000)) {
    await logSecurityEvent({
      event: 'SUSPICIOUS_ACTIVITY',
      ip,
      details: { reason: 'excessive_cancellation_attempts' }
    });
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }
  const booking = await prisma.booking.findUnique({ where: { cancellationToken: token }, include: { service: { include: { coach: { include: { user: true } } } }, classOccurrence: true } });
  if (!booking) return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 404 });

  const policy = await prisma.cancellationPolicy.findUnique({ where: { id: 'default_policy' } });
  const minHours = policy?.minHoursNotice ?? 4;
  const now = new Date();
  const msBefore = booking.startDateTimeUTC.getTime() - now.getTime();
  const allowed = msBefore > minHours * 60 * 60 * 1000;

  if (!allowed) {
    return NextResponse.json({ ok: false, message: 'Cancellations must be at least 4 hours before start. Please call the front desk.' }, { status: 200 });
  }

  if (booking.status === 'CANCELLED') {
    return NextResponse.json({ ok: true, message: 'Already cancelled' });
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  const coachEmail = booking.service.coach?.user?.email || undefined;
  const settings = booking.service.coachId ? await (prisma as any).coachSettings.findUnique({ where: { coachId: booking.service.coachId } }).catch(()=>null) : null;
  const coachEmails = [coachEmail, ...(settings?.alertEmails || [])].filter(Boolean) as string[];
  const title = booking.service.type === 'CLASS' ? booking.service.title : 'Private Lesson';
  const ics = buildICS({
    uid: booking.id,
    start: booking.startDateTimeUTC,
    end: booking.endDateTimeUTC,
    summary: `${title} — Cancelled`,
    location: process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345',
    description: 'This event has been cancelled.',
    organizerEmail: SENDER,
    method: 'CANCEL',
  });

  try {
    await resend.emails.send({
      from: `Spirit Athletics <${SENDER}>`,
      to: [booking.customerEmail],
      subject: `Booking Cancelled: ${title}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111"><p>Your booking has been cancelled.</p></div>`,
      attachments: [{ filename: 'cancel.ics', content: ics, contentType: 'text/calendar' }],
    });
    if (coachEmails.length > 0) {
      await resend.emails.send({
        from: `Spirit Athletics <${SENDER}>`,
        to: coachEmails,
        subject: `[Coach Copy] Booking Cancelled: ${title}`,
        html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111"><p>A booking has been cancelled.</p></div>`,
        attachments: [{ filename: 'cancel.ics', content: ics, contentType: 'text/calendar' }],
      });
    }
  } catch {
    // ignore email failures for now
  }

  return NextResponse.json({ ok: true });
} 