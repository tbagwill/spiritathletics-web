import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.SENDER_EMAIL || 'booking@spiritathletics.net';

export async function sendBookingEmails(params: {
    customerEmail: string;
    coachEmails?: (string | null | undefined)[];
    subject: string;
    htmlCustomer: string;
    htmlCoach: string;
    icsContent: string;
}) {
    const { customerEmail, coachEmails, subject, htmlCustomer, htmlCoach, icsContent } = params;

	await resend.emails.send({
		from: `Spirit Athletics <${SENDER}>`,
		to: [customerEmail],
		subject,
		html: htmlCustomer,
		attachments: [
			{ filename: 'event.ics', content: icsContent, contentType: 'text/calendar' },
		],
	});

    const filteredCoachEmails = (coachEmails || []).filter((e): e is string => !!e);
    if (filteredCoachEmails.length > 0) {
        await resend.emails.send({
			from: `Spirit Athletics <${SENDER}>`,
            to: filteredCoachEmails,
			subject: `[Coach Copy] ${subject}`,
			html: htmlCoach,
			attachments: [
				{ filename: 'event.ics', content: icsContent, contentType: 'text/calendar' },
			],
		});
	}
}

export function buildCustomerHtml(title: string, when: string, location: string, cancelUrl?: string) {
	return `
		<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
			<h2 style="margin:0 0 12px 0">Your booking is confirmed</h2>
			<p style="margin:0 0 4px 0"><strong>${escape(title)}</strong></p>
			<p style="margin:0 0 4px 0">${escape(when)}</p>
			<p style="margin:0 0 12px 0">${escape(location)}</p>
			${cancelUrl ? `<p style="margin:0 0 8px 0">You can cancel up to 4 hours before start: <a href="${cancelUrl}">${cancelUrl}</a></p>` : ''}
			<p style="margin:0">We look forward to seeing you!</p>
		</div>
	`;
}

export function buildCoachHtml(title: string, when: string, customer: string, athlete: string) {
	return `
		<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
			<h2 style="margin:0 0 12px 0">New booking</h2>
			<p style="margin:0 0 4px 0"><strong>${escape(title)}</strong></p>
			<p style="margin:0 0 4px 0">${escape(when)}</p>
			<p style="margin:0">Customer: ${escape(customer)} • Athlete: ${escape(athlete)}</p>
		</div>
	`;
}

function escape(s: string) {
	return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
} 