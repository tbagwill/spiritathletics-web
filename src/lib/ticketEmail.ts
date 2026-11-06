import { Resend } from 'resend';
import QRCode from 'qrcode';
import { formatPt } from '@/lib/time';

const resend = new Resend(process.env.RESEND_API_KEY);
const TICKETS_SENDER = process.env.TICKETS_SENDER_EMAIL || 'tickets@spiritathletics.net';
const TICKETS_REPLY_TO = process.env.TICKETS_REPLY_TO || 'frontdesk@spiritathletics.net';
const FROM = `Spirit Athletics Tickets <${TICKETS_SENDER}>`;
const CHECKIN_QR_CID = 'checkin-qr';

export type TicketEmailTicket = {
  id: string;
  tierName: string;
  priceCents: number;
};

export type TicketEmailEvent = {
  title: string;
  startDateTimeUTC: Date;
  doorsOpenUTC: Date | null;
  endDateTimeUTC: Date | null;
  venue: string | null;
  venueAddress: string | null;
};

export type TicketEmailOrder = {
  id: string;
  customerName: string;
  subtotalCents: number;
  feeCents: number;
  totalCents: number;
};

// Rendered at 2x and displayed at 220px so it stays sharp on retina screens.
function qrPng(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 440,
    color: { dark: '#000000', light: '#FFFFFF' },
  });
}

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function groupByTier(tickets: TicketEmailTicket[]) {
  const groups = new Map<string, { tierName: string; count: number; totalCents: number }>();
  for (const t of tickets) {
    const g = groups.get(t.tierName) || { tierName: t.tierName, count: 0, totalCents: 0 };
    g.count += 1;
    g.totalCents += t.priceCents;
    groups.set(t.tierName, g);
  }
  return [...groups.values()];
}

export function buildTicketOrderHtml(params: {
  event: TicketEmailEvent;
  order: TicketEmailOrder;
  tickets: TicketEmailTicket[];
  ticketsUrl: string;
}): string {
  const { event, order, tickets, ticketsUrl } = params;
  const groups = groupByTier(tickets);
  const count = tickets.length;
  const breakdown = groups.map((g) => `${g.count} ${esc(g.tierName)}`).join(', ');

  const whenLine = formatPt(event.startDateTimeUTC, "EEEE, MMMM d, yyyy 'at' h:mm a 'PT'");
  const doorsLine = event.doorsOpenUTC ? `Doors open ${formatPt(event.doorsOpenUTC, "h:mm a 'PT'")}` : '';
  const venueLine = event.venue
    ? `${esc(event.venue)}${event.venueAddress ? ` · ${esc(event.venueAddress)}` : ''}`
    : '';
  const url = esc(ticketsUrl);

  const lineItems = groups
    .map(
      (g) =>
        `<tr><td style="padding:2px 0;">${g.count} × ${esc(g.tierName)}</td><td align="right" style="padding:2px 0;">${dollars(g.totalCents)}</td></tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <!-- Header -->
        <tr>
          <td style="background:#0000FE;background:linear-gradient(135deg,#0000FE,#4169E1);padding:28px 28px 20px;color:#ffffff;">
            <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">Your tickets are confirmed</div>
            <div style="font-size:22px;font-weight:700;margin-top:4px;">${esc(event.title)}</div>
            <div style="font-size:14px;margin-top:6px;opacity:0.95;">${whenLine}</div>
            ${doorsLine ? `<div style="font-size:13px;margin-top:2px;opacity:0.9;">${doorsLine}</div>` : ''}
            ${venueLine ? `<div style="font-size:13px;margin-top:2px;opacity:0.9;">${venueLine}</div>` : ''}
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:20px 28px 0;">
            <p style="margin:0 0 6px;font-size:15px;line-height:1.5;color:#111827;">Hi ${esc(order.customerName.split(' ')[0] || 'there')},</p>
            <p style="margin:0;font-size:14px;line-height:1.55;color:#4b5563;">
              You're all set: <strong style="color:#111827;">${plural(count, 'ticket')}</strong> (${breakdown}).
            </p>
          </td>
        </tr>

        <!-- Check-in QR -->
        <tr>
          <td style="padding:18px 28px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;">
              <tr>
                <td align="center" style="padding:18px 16px;">
                  <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;">${count === 1 ? 'Your check-in code' : 'Check in your whole group'}</div>
                  <img src="cid:${CHECKIN_QR_CID}" alt="Check-in QR code" width="220" height="220" style="display:block;margin:12px auto;width:220px;height:220px;" />
                  <div style="font-size:14px;line-height:1.5;color:#374151;max-width:380px;">
                    Show this at the door. ${count === 1 ? 'Staff will scan it and hand you your wristband.' : `One scan checks in all ${count} tickets, and staff will hand you ${count} wristbands.`}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Ticket page button -->
        <tr>
          <td align="center" style="padding:20px 28px 0;">
            <a href="${url}" style="display:inline-block;background:#0000FE;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:999px;">${count === 1 ? 'View your ticket' : 'View individual tickets'}</a>
            ${count > 1 ? `<div style="font-size:13px;color:#6b7280;margin-top:10px;line-height:1.5;">Splitting up? Each ticket has its own code on your ticket page.</div>` : ''}
          </td>
        </tr>

        <!-- Tips -->
        <tr>
          <td style="padding:20px 28px 0;">
            <p style="margin:0;font-size:13px;line-height:1.55;color:#4b5563;">
              Cell service at the venue can be spotty, so open this email or your ticket page before you arrive.
              Each ticket becomes a wristband, your re-entry pass. Lost wristbands can't be replaced.
            </p>
          </td>
        </tr>

        <!-- Order summary -->
        <tr>
          <td style="padding:20px 28px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;">
              <tr><td style="padding:14px 16px;">
                <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">Order summary</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;">
                  ${lineItems}
                  <tr><td style="padding:2px 0;">Online convenience fee</td><td align="right" style="padding:2px 0;">${dollars(order.feeCents)}</td></tr>
                  <tr><td style="padding-top:8px;border-top:1px solid #e5e7eb;font-weight:600;color:#111827;">Total</td><td align="right" style="padding-top:8px;border-top:1px solid #e5e7eb;font-weight:600;color:#111827;">${dollars(order.totalCents)}</td></tr>
                </table>
                <div style="font-size:11px;color:#9ca3af;margin-top:10px;">Order ${esc(order.id.slice(-8).toUpperCase())}</div>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 28px 28px;font-size:12px;color:#9ca3af;line-height:1.55;">
            All sales are final: no refunds, no transfers. Questions? Reply to this email or contact
            <a href="mailto:${TICKETS_REPLY_TO}" style="color:#4b5563;">${TICKETS_REPLY_TO}</a>.
          </td>
        </tr>
      </table>

      <div style="max-width:560px;margin:14px auto 0;text-align:center;font-size:11px;color:#9ca3af;">
        Spirit Athletics · 17537 Bear Valley Rd, Hesperia, CA 92345
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendTicketOrderEmail(params: {
  to: string;
  event: TicketEmailEvent;
  order: TicketEmailOrder;
  tickets: TicketEmailTicket[];
  ticketsUrl: string;
  checkinQrPayload: string;
  icsContent?: string;
}) {
  const html = buildTicketOrderHtml(params);
  const qr = await qrPng(params.checkinQrPayload);

  const attachments: {
    filename: string;
    content: Buffer | string;
    contentType: string;
    inlineContentId?: string;
  }[] = [{ filename: 'checkin-qr.png', content: qr, contentType: 'image/png', inlineContentId: CHECKIN_QR_CID }];
  if (params.icsContent) {
    attachments.push({ filename: 'event.ics', content: params.icsContent, contentType: 'text/calendar' });
  }

  const { error } = await resend.emails.send({
    from: FROM,
    replyTo: TICKETS_REPLY_TO,
    to: [params.to],
    subject: `Your tickets · ${params.event.title}`,
    html,
    attachments,
  });
  if (error) throw new Error(`Resend rejected ticket email: ${error.message}`);
}

/** Sent when payment succeeded but tickets couldn't be issued (e.g. a tier sold out mid-checkout). */
export async function sendTicketOrderFailedEmail(params: {
  to: string;
  customerName: string;
  eventTitle: string;
  refunded: boolean;
}) {
  const first = esc(params.customerName.split(' ')[0] || 'there');
  const body = params.refunded
    ? 'The tickets you picked sold out while you were checking out, so we couldn&apos;t issue them. Your payment has been refunded in full. It can take 5–10 business days to show up on your statement.'
    : 'Something went wrong issuing your tickets after your payment went through. Our team has been notified and will contact you to make it right.';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;">
    <tr><td style="padding:28px;">
      <div style="font-size:20px;font-weight:700;margin-bottom:12px;">We couldn't complete your order</div>
      <p style="margin:0 0 10px;font-size:15px;line-height:1.55;">Hi ${first},</p>
      <p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:#374151;">${body}</p>
      <p style="margin:0;font-size:14px;line-height:1.55;color:#374151;">
        Event: ${esc(params.eventTitle)}<br/>
        Questions? Reply to this email or contact <a href="mailto:${TICKETS_REPLY_TO}" style="color:#4b5563;">${TICKETS_REPLY_TO}</a>.
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from: FROM,
    replyTo: TICKETS_REPLY_TO,
    to: [params.to],
    subject: `Order update · ${params.eventTitle}`,
    html,
  });
  if (error) throw new Error(`Resend rejected failure email: ${error.message}`);
}
