type IcsMethod = 'REQUEST' | 'CANCEL';

function pad(n: number): string {
	return n < 10 ? `0${n}` : `${n}`;
}

function formatIcsDateUTC(d: Date): string {
	const year = d.getUTCFullYear();
	const month = pad(d.getUTCMonth() + 1);
	const day = pad(d.getUTCDate());
	const hours = pad(d.getUTCHours());
	const minutes = pad(d.getUTCMinutes());
	const seconds = pad(d.getUTCSeconds());
	return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

export function buildICS(params: {
	uid: string;
	start: Date;
	end: Date;
	summary: string;
	location: string;
	description?: string;
	organizerEmail: string;
	method?: IcsMethod;
}): string {
	const { uid, start, end, summary, location, description, organizerEmail } = params;
	const method: IcsMethod = params.method || 'REQUEST';
	const dtStamp = formatIcsDateUTC(new Date());
	const dtStart = formatIcsDateUTC(start);
	const dtEnd = formatIcsDateUTC(end);
	const desc = (description || '').replace(/\n/g, '\\n');

	return [
		'BEGIN:VCALENDAR',
		'PRODID:-//Spirit Athletics//Booking//EN',
		'VERSION:2.0',
		`METHOD:${method}`,
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${dtStamp}`,
		`DTSTART:${dtStart}`,
		`DTEND:${dtEnd}`,
		`SUMMARY:${escapeText(summary)}`,
		`LOCATION:${escapeText(location)}`,
		`ORGANIZER:mailto:${organizerEmail}`,
		`DESCRIPTION:${escapeText(desc)}`,
		'END:VEVENT',
		'END:VCALENDAR',
	].join('\r\n');
}

function escapeText(text: string): string {
	return text
		.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\n')
		.replace(/\,/g, '\\,')
		.replace(/\;/g, '\\;');
} 