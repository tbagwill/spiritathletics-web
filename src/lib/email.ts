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
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Booking Confirmed</title>
		</head>
		<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
			<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
				<tr>
					<td align="center" style="padding:40px 20px;">
						<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;">
							<!-- Header Image -->
							<tr>
								<td style="padding:0;">
									<img src="${baseUrl}/images/WebEmails-Bookings.png" alt="Spirit Athletics Bookings" width="600" style="display:block;width:100%;height:auto;border:0;">
								</td>
							</tr>
							
							<!-- Main Content -->
							<tr>
								<td style="padding:40px 40px 20px 40px;">
									<h1 style="margin:0 0 12px 0;color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;">
										🎉 You're All Set!
									</h1>
									<p style="margin:0 0 24px 0;color:#64748b;font-size:16px;line-height:1.6;">
										Your booking has been confirmed. We're excited to see you at Spirit Athletics!
									</p>
								</td>
							</tr>
							
							<!-- Booking Details Card -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:8px;overflow:hidden;">
										<tr>
											<td style="padding:24px;">
												<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
													<tr>
														<td style="padding-bottom:16px;">
															<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
																Lesson Type
															</p>
															<p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
																${escape(title)}
															</p>
														</td>
													</tr>
													<tr>
														<td style="padding-bottom:16px;">
															<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
																📅 Date & Time
															</p>
															<p style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">
																${escape(when)}
															</p>
														</td>
													</tr>
													<tr>
														<td>
															<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
																📍 Location
															</p>
															<p style="margin:0;color:#ffffff;font-size:16px;font-weight:500;">
																${escape(location)}
															</p>
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- Important Information -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<div style="background-color:#f0f9ff;border-left:4px solid #3b82f6;padding:16px 20px;border-radius:6px;">
										<p style="margin:0 0 8px 0;color:#1e40af;font-size:14px;font-weight:700;">
											📌 Important Information
										</p>
										<p style="margin:0;color:#1e40af;font-size:14px;line-height:1.6;">
											• Please arrive 5-10 minutes early<br>
											• Bring water and a positive attitude!<br>
											• A calendar invite is attached to this email
										</p>
									</div>
								</td>
							</tr>
							
							${cancelUrl ? `
							<!-- Cancellation Policy -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:16px 20px;border-radius:6px;">
										<p style="margin:0 0 8px 0;color:#991b1b;font-size:14px;font-weight:700;">
											Cancellation Policy
										</p>
										<p style="margin:0 0 12px 0;color:#7f1d1d;font-size:14px;line-height:1.6;">
											You can cancel up to <strong>4 hours before</strong> your session start time without penalty.
										</p>
										<a href="${cancelUrl}" style="display:inline-block;padding:10px 20px;background-color:#dc2626;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
											Cancel Booking
										</a>
									</div>
								</td>
							</tr>
							` : ''}
							
							<!-- Footer -->
							<tr>
								<td style="padding:32px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
									<p style="margin:0 0 8px 0;color:#64748b;font-size:14px;line-height:1.6;text-align:center;">
										Questions? Contact us at <a href="mailto:info@spiritathletics.net" style="color:#667eea;text-decoration:none;font-weight:600;">info@spiritathletics.net</a>
									</p>
									<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
										Spirit Athletics • 17537 Bear Valley Rd, Hesperia, CA 92345
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;
}

export function buildCoachHtml(title: string, when: string, customer: string, athlete: string) {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>New Booking</title>
		</head>
		<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
			<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
				<tr>
					<td align="center" style="padding:40px 20px;">
						<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;">
							<!-- Header Image -->
							<tr>
								<td style="padding:0;">
									<img src="${baseUrl}/images/WebEmails-Bookings.png" alt="Spirit Athletics Bookings" width="600" style="display:block;width:100%;height:auto;border:0;">
								</td>
							</tr>
							
							<!-- Main Content -->
							<tr>
								<td style="padding:40px 40px 20px 40px;">
									<h1 style="margin:0 0 12px 0;color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;">
										📅 New Booking Confirmed
									</h1>
									<p style="margin:0 0 24px 0;color:#64748b;font-size:16px;line-height:1.6;">
										A new session has been booked. The calendar invite is attached.
									</p>
								</td>
							</tr>
							
							<!-- Session Details -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%);border-radius:8px;">
										<tr>
											<td style="padding:24px;">
												<p style="margin:0 0 16px 0;color:rgba(255,255,255,0.9);font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
													Session Details
												</p>
												<p style="margin:0 0 8px 0;color:#ffffff;font-size:20px;font-weight:700;">
													${escape(title)}
												</p>
												<p style="margin:0;color:rgba(255,255,255,0.95);font-size:16px;font-weight:500;">
													📅 ${escape(when)}
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- Client Information -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:2px solid #e2e8f0;">
										<tr>
											<td style="padding:20px;">
												<p style="margin:0 0 12px 0;color:#475569;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
													Client Information
												</p>
												<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
													<tr>
														<td style="padding:8px 0;">
															<p style="margin:0;color:#64748b;font-size:13px;font-weight:600;">Parent/Guardian:</p>
															<p style="margin:4px 0 0 0;color:#1e293b;font-size:16px;font-weight:600;">${escape(customer)}</p>
														</td>
													</tr>
													<tr>
														<td style="padding:8px 0;">
															<p style="margin:0;color:#64748b;font-size:13px;font-weight:600;">Athlete:</p>
															<p style="margin:4px 0 0 0;color:#1e293b;font-size:16px;font-weight:600;">${escape(athlete)}</p>
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- Footer -->
							<tr>
								<td style="padding:24px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
									<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
										Spirit Athletics • 17537 Bear Valley Rd, Hesperia, CA 92345
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
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
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Request Submitted</title>
		</head>
		<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
			<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
				<tr>
					<td align="center" style="padding:40px 20px;">
						<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;">
							<!-- Header Image -->
							<tr>
								<td style="padding:0;">
									<img src="${baseUrl}/images/WebEmails-Bookings.png" alt="Spirit Athletics Bookings" width="600" style="display:block;width:100%;height:auto;border:0;">
								</td>
							</tr>
							
							<!-- Main Content -->
							<tr>
								<td style="padding:40px 40px 20px 40px;">
									<h1 style="margin:0 0 12px 0;color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;">
										⏳ Request Submitted!
									</h1>
									<p style="margin:0 0 24px 0;color:#64748b;font-size:16px;line-height:1.6;">
										Your private lesson request has been submitted and is awaiting coach approval. We'll notify you as soon as your coach responds!
									</p>
								</td>
							</tr>
							
							<!-- Requested Session Details -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:8px;">
										<tr>
											<td style="padding:24px;">
												<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
													<tr>
														<td style="padding-bottom:16px;">
															<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
																Requested Session
															</p>
															<p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
																${escape(title)}
															</p>
														</td>
													</tr>
													<tr>
														<td style="padding-bottom:16px;">
															<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
																📅 Date & Time
															</p>
															<p style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">
																${escape(when)}
															</p>
														</td>
													</tr>
													<tr>
														<td>
															<p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
																📍 Location
															</p>
															<p style="margin:0;color:#ffffff;font-size:16px;font-weight:500;">
																${escape(location)}
															</p>
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- What Happens Next -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:6px;">
										<p style="margin:0 0 8px 0;color:#92400e;font-size:14px;font-weight:700;">
											⏰ What Happens Next?
										</p>
										<p style="margin:0;color:#78350f;font-size:14px;line-height:1.6;">
											1. Your coach will review your request<br>
											2. You'll receive an email once approved<br>
											3. A calendar invite will be sent upon approval
										</p>
									</div>
								</td>
							</tr>
							
							<!-- Cancel Request Button -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<div style="background-color:#f8fafc;border-radius:8px;padding:20px;text-align:center;">
										<p style="margin:0 0 12px 0;color:#64748b;font-size:14px;">
											Need to cancel your request?
										</p>
										<a href="${cancelUrl}" style="display:inline-block;padding:12px 24px;background-color:#64748b;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
											Cancel Request
										</a>
									</div>
								</td>
							</tr>
							
							<!-- Footer -->
							<tr>
								<td style="padding:32px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
									<p style="margin:0 0 8px 0;color:#64748b;font-size:14px;line-height:1.6;text-align:center;">
										Questions? Contact us at <a href="mailto:info@spiritathletics.net" style="color:#667eea;text-decoration:none;font-weight:600;">info@spiritathletics.net</a>
									</p>
									<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
										Spirit Athletics • 17537 Bear Valley Rd, Hesperia, CA 92345
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;
}

export function buildCoachApprovalNeededHtml(title: string, when: string, customer: string, athlete: string, dashboardUrl: string) {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Action Required - Approval Needed</title>
		</head>
		<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
			<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
				<tr>
					<td align="center" style="padding:40px 20px;">
						<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;border:3px solid #f59e0b;">
							<!-- Header Image -->
							<tr>
								<td style="padding:0;">
									<img src="${baseUrl}/images/WebEmails-Bookings.png" alt="Spirit Athletics Bookings" width="600" style="display:block;width:100%;height:auto;border:0;">
								</td>
							</tr>
							
							<!-- Urgent Banner -->
							<tr>
								<td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:16px 40px;">
									<p style="margin:0;color:#ffffff;font-size:14px;font-weight:700;text-align:center;text-transform:uppercase;letter-spacing:1px;">
										⏰ Action Required
									</p>
								</td>
							</tr>
							
							<!-- Main Content -->
							<tr>
								<td style="padding:32px 40px 20px 40px;">
									<h1 style="margin:0 0 12px 0;color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;">
										New Lesson Request
									</h1>
									<p style="margin:0 0 24px 0;color:#64748b;font-size:16px;line-height:1.6;">
										A customer has requested a private lesson and is waiting for your approval. Please review the details below and respond promptly.
									</p>
								</td>
							</tr>
							
							<!-- Request Details -->
							<tr>
								<td style="padding:0 40px 24px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);border-radius:8px;">
										<tr>
											<td style="padding:24px;">
												<p style="margin:0 0 16px 0;color:rgba(255,255,255,0.9);font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
													Requested Session
												</p>
												<p style="margin:0 0 8px 0;color:#ffffff;font-size:20px;font-weight:700;">
													${escape(title)}
												</p>
												<p style="margin:0;color:rgba(255,255,255,0.95);font-size:16px;font-weight:500;">
													📅 ${escape(when)}
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- Client Information -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fef3c7;border-radius:8px;border:2px solid #f59e0b;">
										<tr>
											<td style="padding:20px;">
												<p style="margin:0 0 12px 0;color:#78350f;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
													Client Information
												</p>
												<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
													<tr>
														<td style="padding:8px 0;">
															<p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">Parent/Guardian:</p>
															<p style="margin:4px 0 0 0;color:#78350f;font-size:16px;font-weight:700;">${escape(customer)}</p>
														</td>
													</tr>
													<tr>
														<td style="padding:8px 0;">
															<p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">Athlete:</p>
															<p style="margin:4px 0 0 0;color:#78350f;font-size:16px;font-weight:700;">${escape(athlete)}</p>
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- CTA Button -->
							<tr>
								<td style="padding:0 40px 40px 40px;text-align:center;">
									<a href="${dashboardUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:700;box-shadow:0 4px 6px rgba(37,99,235,0.3);">
										View & Respond in Dashboard →
									</a>
									<p style="margin:16px 0 0 0;color:#94a3b8;font-size:13px;">
										Or copy this link: ${dashboardUrl}
									</p>
								</td>
							</tr>
							
							<!-- Footer -->
							<tr>
								<td style="padding:24px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
									<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
										Spirit Athletics • 17537 Bear Valley Rd, Hesperia, CA 92345
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;
}

export function buildCustomerDeclinedHtml(title: string, when: string) {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
	const bookingUrl = `${baseUrl}/book/privates`;
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Request Update</title>
		</head>
		<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
			<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
				<tr>
					<td align="center" style="padding:40px 20px;">
						<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;">
							<!-- Header Image -->
							<tr>
								<td style="padding:0;">
									<img src="${baseUrl}/images/WebEmails-Bookings.png" alt="Spirit Athletics Bookings" width="600" style="display:block;width:100%;height:auto;border:0;">
								</td>
							</tr>
							
							<!-- Main Content -->
							<tr>
								<td style="padding:40px 40px 20px 40px;">
									<h1 style="margin:0 0 12px 0;color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;">
										Request Update
									</h1>
									<p style="margin:0 0 24px 0;color:#64748b;font-size:16px;line-height:1.6;">
										We wanted to let you know about a change to your private lesson request.
									</p>
								</td>
							</tr>
							
							<!-- Request Details -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:2px solid #e2e8f0;">
										<tr>
											<td style="padding:24px;">
												<p style="margin:0 0 12px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
													Requested Session
												</p>
												<p style="margin:0 0 8px 0;color:#1e293b;font-size:18px;font-weight:700;">
													${escape(title)}
												</p>
												<p style="margin:0;color:#64748b;font-size:15px;font-weight:500;">
													📅 ${escape(when)}
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- Status Message -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<div style="background-color:#fef2f2;border-left:4px solid #f87171;padding:16px 20px;border-radius:6px;">
										<p style="margin:0 0 8px 0;color:#991b1b;font-size:14px;font-weight:700;">
											Time Slot No Longer Available
										</p>
										<p style="margin:0;color:#7f1d1d;font-size:14px;line-height:1.6;">
											Unfortunately, this time slot is no longer available. This could happen if the slot was already booked by someone else or if there was a scheduling conflict.
										</p>
									</div>
								</td>
							</tr>
							
							<!-- Next Steps -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<div style="background-color:#f0f9ff;border-left:4px solid #3b82f6;padding:16px 20px;border-radius:6px;">
										<p style="margin:0 0 8px 0;color:#1e40af;font-size:14px;font-weight:700;">
											📌 What You Can Do
										</p>
										<p style="margin:0 0 16px 0;color:#1e40af;font-size:14px;line-height:1.6;">
											• Choose a different available time slot<br>
											• Contact us to discuss alternative options<br>
											• Check back regularly for new availability
										</p>
										<a href="${bookingUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
											View Available Times
										</a>
									</div>
								</td>
							</tr>
							
							<!-- Footer -->
							<tr>
								<td style="padding:32px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
									<p style="margin:0 0 8px 0;color:#64748b;font-size:14px;line-height:1.6;text-align:center;">
										Questions? We're here to help! <a href="mailto:info@spiritathletics.net" style="color:#667eea;text-decoration:none;font-weight:600;">info@spiritathletics.net</a>
									</p>
									<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
										Spirit Athletics • 17537 Bear Valley Rd, Hesperia, CA 92345
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;
}

export function buildPendingCancelledCustomerHtml(title: string, when: string) {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
	const bookingUrl = `${baseUrl}/book/privates`;
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Request Cancelled</title>
		</head>
		<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
			<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
				<tr>
					<td align="center" style="padding:40px 20px;">
						<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;">
							<!-- Header Image -->
							<tr>
								<td style="padding:0;">
									<img src="${baseUrl}/images/WebEmails-Bookings.png" alt="Spirit Athletics Bookings" width="600" style="display:block;width:100%;height:auto;border:0;">
								</td>
							</tr>
							
							<!-- Main Content -->
							<tr>
								<td style="padding:40px 40px 20px 40px;">
									<h1 style="margin:0 0 12px 0;color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;">
										Request Cancelled
									</h1>
									<p style="margin:0 0 24px 0;color:#64748b;font-size:16px;line-height:1.6;">
										Your private lesson request has been successfully cancelled. No further action is needed.
									</p>
								</td>
							</tr>
							
							<!-- Cancelled Request Details -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:2px solid #e2e8f0;">
										<tr>
											<td style="padding:24px;">
												<p style="margin:0 0 12px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
													Cancelled Request
												</p>
												<p style="margin:0 0 8px 0;color:#1e293b;font-size:18px;font-weight:700;">
													${escape(title)}
												</p>
												<p style="margin:0;color:#64748b;font-size:15px;font-weight:500;">
													📅 ${escape(when)}
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- Book Again -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<div style="background-color:#f0fdf4;border-left:4px solid #22c55e;padding:16px 20px;border-radius:6px;text-align:center;">
										<p style="margin:0 0 12px 0;color:#166534;font-size:14px;font-weight:600;">
											Ready to book a new session?
										</p>
										<a href="${bookingUrl}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;">
											View Available Times
										</a>
									</div>
								</td>
							</tr>
							
							<!-- Footer -->
							<tr>
								<td style="padding:32px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
									<p style="margin:0 0 8px 0;color:#64748b;font-size:14px;line-height:1.6;text-align:center;">
										Questions? Contact us at <a href="mailto:info@spiritathletics.net" style="color:#667eea;text-decoration:none;font-weight:600;">info@spiritathletics.net</a>
									</p>
									<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
										Spirit Athletics • 17537 Bear Valley Rd, Hesperia, CA 92345
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;
}

export function buildPendingCancelledCoachHtml(title: string, when: string, customer: string, athlete: string) {
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://spiritathletics.net';
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Request Cancelled</title>
		</head>
		<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
			<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f7fb;">
				<tr>
					<td align="center" style="padding:40px 20px;">
						<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);max-width:100%;">
							<!-- Header Image -->
							<tr>
								<td style="padding:0;">
									<img src="${baseUrl}/images/WebEmails-Bookings.png" alt="Spirit Athletics Bookings" width="600" style="display:block;width:100%;height:auto;border:0;">
								</td>
							</tr>
							
							<!-- Main Content -->
							<tr>
								<td style="padding:40px 40px 20px 40px;">
									<h1 style="margin:0 0 12px 0;color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;">
										Request Cancelled
									</h1>
									<p style="margin:0 0 24px 0;color:#64748b;font-size:16px;line-height:1.6;">
										A pending private lesson request has been cancelled by the customer. No action is needed from you.
									</p>
								</td>
							</tr>
							
							<!-- Cancelled Request Details -->
							<tr>
								<td style="padding:0 40px 24px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:2px solid #e2e8f0;">
										<tr>
											<td style="padding:24px;">
												<p style="margin:0 0 12px 0;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
													Cancelled Request
												</p>
												<p style="margin:0 0 8px 0;color:#1e293b;font-size:18px;font-weight:700;">
													${escape(title)}
												</p>
												<p style="margin:0;color:#64748b;font-size:15px;font-weight:500;">
													📅 ${escape(when)}
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- Client Information -->
							<tr>
								<td style="padding:0 40px 32px 40px;">
									<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc;border-radius:8px;border:2px solid #e2e8f0;">
										<tr>
											<td style="padding:20px;">
												<p style="margin:0 0 12px 0;color:#475569;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
													Client Information
												</p>
												<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
													<tr>
														<td style="padding:8px 0;">
															<p style="margin:0;color:#64748b;font-size:13px;font-weight:600;">Parent/Guardian:</p>
															<p style="margin:4px 0 0 0;color:#1e293b;font-size:16px;font-weight:600;">${escape(customer)}</p>
														</td>
													</tr>
													<tr>
														<td style="padding:8px 0;">
															<p style="margin:0;color:#64748b;font-size:13px;font-weight:600;">Athlete:</p>
															<p style="margin:4px 0 0 0;color:#1e293b;font-size:16px;font-weight:600;">${escape(athlete)}</p>
														</td>
													</tr>
												</table>
											</td>
										</tr>
									</table>
								</td>
							</tr>
							
							<!-- Footer -->
							<tr>
								<td style="padding:24px 40px;background-color:#f8fafc;border-top:1px solid #e2e8f0;">
									<p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;text-align:center;">
										Spirit Athletics • 17537 Bear Valley Rd, Hesperia, CA 92345
									</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</body>
		</html>
	`;
}

function escape(s: string) {
	return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
} 