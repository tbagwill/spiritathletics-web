import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CARD_FEE_CENTS } from '@/lib/pricing';
import { z } from 'zod';
import { rateLimitHit } from '@/lib/rateLimit';
import { formatPt } from '@/lib/time';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const BodySchema = z.object({
  clinicId: z.string().cuid(),
  customerName: z.string().min(1).max(100).trim(),
  customerEmail: z.string().email().max(255).toLowerCase(),
  athleteFirstNames: z.array(z.string().min(1).max(100).trim()).min(1).max(10),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parse = BodySchema.safeParse(json);
  if (!parse.success) {
    return NextResponse.json({ ok: false, error: 'Invalid input', issues: parse.error.format() }, { status: 400 });
  }
  const { clinicId, customerName, customerEmail, athleteFirstNames } = parse.data;
  const numAthletes = athleteFirstNames.length;

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const key = `clinic-cash:${ip}:${customerEmail}`;
  if (!rateLimitHit(key, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests, please try again shortly.' }, { status: 429 });
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      include: {
        registrations: { where: { status: 'CONFIRMED' }, select: { id: true } },
      },
    });

    if (!clinic || !clinic.isActive) {
      return NextResponse.json({ ok: false, error: 'Clinic not found or no longer active' }, { status: 400 });
    }
    if (clinic.dateTimeUTC < new Date()) {
      return NextResponse.json({ ok: false, error: 'This clinic has already passed' }, { status: 400 });
    }
    const spotsLeft = clinic.capacity - clinic.registrations.length;
    if (numAthletes > spotsLeft) {
      return NextResponse.json({ ok: false, error: `Only ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining` }, { status: 400 });
    }

    const registrations = await prisma.$transaction(
      athleteFirstNames.map((name) =>
        prisma.clinicRegistration.create({
          data: {
            clinicId,
            customerName,
            customerEmail,
            athleteFirstName: name,
            paymentMethod: 'CASH',
            status: 'CONFIRMED',
          },
        })
      )
    );

    try {
      const when = formatPt(clinic.dateTimeUTC, "EEE, MMM d • h:mm a 'PT'");
      const location = clinic.location || process.env.ORG_ADDRESS || 'Spirit Athletics, 17537 Bear Valley Rd, Hesperia, CA 92345';
      const SENDER = process.env.SENDER_EMAIL || 'booking@spiritathletics.net';
      const cashTotal = `$${((clinic.priceCents * numAthletes) / 100).toFixed(2)}`;
      const cardTotal = `$${((clinic.priceCents * numAthletes + CARD_FEE_CENTS) / 100).toFixed(2)}`;

      await resend.emails.send({
        from: `Spirit Athletics <${SENDER}>`,
        to: [customerEmail],
        subject: `Clinic Registration Confirmed: ${clinic.title} (Pay Cash On-Site)`,
        html: buildCashClinicConfirmationHtml(clinic.title, when, location, customerName, athleteFirstNames, cashTotal, cardTotal),
      });
    } catch (err) {
      console.error('Error sending cash clinic confirmation email:', err);
    }

    return NextResponse.json({ ok: true, registrationIds: registrations.map((r) => r.id) });
  } catch (e: any) {
    console.error('Clinic cash registration error:', e);
    return NextResponse.json({ ok: false, error: e.message ?? 'Registration failed' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildCashClinicConfirmationHtml(title: string, when: string, location: string, customerName: string, athleteFirstNames: string[], cashTotal: string, cardTotal: string): string {
  const athleteList = athleteFirstNames.map((n) => `<strong>${escapeHtml(n)}</strong>`).join(', ');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Clinic Registration Confirmed</title></head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
  <tr><td align="center" style="padding:40px 20px;">
    <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;">
      <tr><td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px 40px 32px;">
        <h1 style="margin:0 0 8px 0;color:#ffffff;font-size:28px;font-weight:700;">&#127881; You're Registered!</h1>
        <p style="margin:0;color:rgba(255,255,255,0.85);font-size:16px;">Hi ${escapeHtml(customerName)}, your spot${athleteFirstNames.length > 1 ? 's are' : ' is'} confirmed!</p>
      </td></tr>
      <tr><td style="padding:32px 40px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border-radius:8px;overflow:hidden;">
          <tr><td style="padding:24px;">
            <p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">&#127919; Clinic</p>
            <p style="margin:0 0 16px 0;color:#ffffff;font-size:20px;font-weight:700;">${escapeHtml(title)}</p>
            <p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">&#128197; Date &amp; Time</p>
            <p style="margin:0 0 16px 0;color:#ffffff;font-size:18px;font-weight:600;">${escapeHtml(when)}</p>
            <p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">&#128205; Location</p>
            <p style="margin:0;color:#ffffff;font-size:16px;font-weight:500;">${escapeHtml(location)}</p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:0 40px 32px 40px;">
        <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:6px;">
          <p style="margin:0 0 8px 0;color:#92400e;font-size:14px;font-weight:700;">&#128176; Cash Payment Required On-Site</p>
          <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6;">
            Please bring <strong>${cashTotal} cash</strong> to pay when you arrive.<br>
            If you do not have cash, the full card price of <strong>${cardTotal}</strong> will apply.
          </p>
        </div>
      </td></tr>
      <tr><td style="padding:0 40px 32px 40px;">
        <div style="background-color:#f0f9ff;border-left:4px solid #7c3aed;padding:16px 20px;border-radius:6px;">
          <p style="margin:0 0 8px 0;color:#4c1d95;font-size:14px;font-weight:700;">&#128204; Clinic Details</p>
          <p style="margin:0;color:#4c1d95;font-size:14px;line-height:1.6;">
            &bull; Please arrive 5-10 minutes early<br>
            &bull; Athlete${athleteFirstNames.length > 1 ? 's' : ''} registered: ${athleteList}<br>
            &bull; Bring water and a positive attitude!
          </p>
        </div>
      </td></tr>
      <tr><td style="padding:32px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="margin:0 0 8px 0;color:#64748b;font-size:14px;line-height:1.6;text-align:center;">
          Questions? Contact us at <a href="mailto:info@spiritathletics.net" style="color:#7c3aed;text-decoration:none;font-weight:600;">info@spiritathletics.net</a>
        </p>
        <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">Spirit Athletics &bull; 17537 Bear Valley Rd, Hesperia, CA 92345</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export const dynamic = 'force-dynamic';
