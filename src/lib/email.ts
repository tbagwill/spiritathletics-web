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

// Pending request emails (no calendar invite)
export async function sendPendingRequestEmails(params: {
	customerEmail: string;
	coachEmails: string[];
	title: string;
	when: string;
	location: string;
	customerName: string;
	athleteName: string;
	cancelUrl: string;
	dashboardUrl: string;
}) {
	const { customerEmail, coachEmails, title, when, location, customerName, athleteName, cancelUrl, dashboardUrl } = params;

	// Customer: request submitted
	await resend.emails.send({
		from: `Spirit Athletics <${SENDER}>`,
		to: [customerEmail],
		subject: `Request Submitted: ${title} (${when})`,
		html: buildCustomerPendingHtml(title, when, location, cancelUrl),
	});

	// Coach: approval needed
	if (coachEmails.length > 0) {
		await resend.emails.send({
			from: `Spirit Athletics <${SENDER}>`,
			to: coachEmails,
			subject: `[Action Required] New Private Lesson Request`,
			html: buildCoachApprovalNeededHtml(title, when, customerName, athleteName, dashboardUrl),
		});
	}
}

export function buildCustomerPendingHtml(title: string, when: string, location: string, cancelUrl: string) {
	return `
		<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
			<h2 style="margin:0 0 12px 0">Your request has been submitted</h2>
			<p style="margin:0 0 12px 0">Your private lesson request is awaiting coach approval.</p>
			<p style="margin:0 0 4px 0"><strong>${escape(title)}</strong></p>
			<p style="margin:0 0 4px 0">${escape(when)}</p>
			<p style="margin:0 0 12px 0">${escape(location)}</p>
			<p style="margin:0 0 8px 0;color:#666">You'll receive a confirmation email with calendar invite once your coach approves the request.</p>
			<p style="margin:0 0 8px 0">You can cancel your request anytime: <a href="${cancelUrl}">${cancelUrl}</a></p>
		</div>
	`;
}

export function buildCoachApprovalNeededHtml(title: string, when: string, customer: string, athlete: string, dashboardUrl: string) {
	return `
		<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
			<h2 style="margin:0 0 12px 0">⏳ New Private Lesson Request</h2>
			<p style="margin:0 0 12px 0">A new private lesson request requires your approval.</p>
			<p style="margin:0 0 4px 0"><strong>${escape(title)}</strong></p>
			<p style="margin:0 0 4px 0">${escape(when)}</p>
			<p style="margin:0 0 12px 0">Customer: ${escape(customer)} • Athlete: ${escape(athlete)}</p>
			<p style="margin:0"><a href="${dashboardUrl}" style="display:inline-block;padding:10px 20px;background:#1d4ed8;color:#fff;text-decoration:none;border-radius:6px">View & Approve Request</a></p>
		</div>
	`;
}

export function buildCustomerDeclinedHtml(title: string, when: string) {
	return `
		<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
			<h2 style="margin:0 0 12px 0">Request Update</h2>
			<p style="margin:0 0 12px 0">Your private lesson request has been declined.</p>
			<p style="margin:0 0 4px 0"><strong>${escape(title)}</strong></p>
			<p style="margin:0 0 12px 0">${escape(when)}</p>
			<p style="margin:0">Please try booking another time slot that works better for your coach's schedule.</p>
		</div>
	`;
}

export function buildPendingCancelledCustomerHtml(title: string, when: string) {
	return `
		<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
			<h2 style="margin:0 0 12px 0">Request Cancelled</h2>
			<p style="margin:0 0 12px 0">Your private lesson request has been cancelled.</p>
			<p style="margin:0 0 4px 0"><strong>${escape(title)}</strong></p>
			<p style="margin:0 0 12px 0">${escape(when)}</p>
			<p style="margin:0">You can book another time slot anytime.</p>
		</div>
	`;
}

export function buildPendingCancelledCoachHtml(title: string, when: string, customer: string, athlete: string) {
	return `
		<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
			<h2 style="margin:0 0 12px 0">Request Cancelled</h2>
			<p style="margin:0 0 12px 0">A pending private lesson request has been cancelled by the customer.</p>
			<p style="margin:0 0 4px 0"><strong>${escape(title)}</strong></p>
			<p style="margin:0 0 4px 0">${escape(when)}</p>
			<p style="margin:0">Customer: ${escape(customer)} • Athlete: ${escape(athlete)}</p>
		</div>
	`;
}

function escape(s: string) {
	return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
} 