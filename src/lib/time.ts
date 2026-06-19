import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { addMinutes, set } from 'date-fns';

export const APP_TZ = process.env.APP_TZ || 'America/Los_Angeles';

/** Return today's date as a YYYY-MM-DD string in Pacific Time. */
export function ptTodayString(): string {
  return formatInTimeZone(new Date(), APP_TZ, 'yyyy-MM-dd');
}

/** Return the PT calendar date (YYYY-MM-DD) for a given UTC instant. */
export function ptDateString(date: Date): string {
  return formatInTimeZone(date, APP_TZ, 'yyyy-MM-dd');
}

/** Parse a YYYY-MM-DD date string as PT midnight, returning the UTC instant. */
export function ptMidnightUtc(dateStr: string): Date {
  return fromZonedTime(dateStr + ' 00:00:00', APP_TZ);
}

export function ptToUtc(date: Date): Date {
  // Interpret date as in PT and convert to UTC
  return fromZonedTime(date, APP_TZ);
}

export function utcToPt(date: Date): Date {
  return toZonedTime(date, APP_TZ);
}

export function formatPt(date: Date, fmt = "EEE, MMM d • h:mm a 'PT'"): string {
  return formatInTimeZone(date, APP_TZ, fmt);
}

export function minutesFromMidnight(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours * 60 + minutes;
}

export function addMinutesUtc(date: Date, minutes: number): Date {
  return addMinutes(date, minutes);
}

export function atLocalMinutes(date: Date, minutes: number): Date {
  // Returns a Date in the same day/timezone as provided date with minutes from midnight
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return addMinutes(d, minutes);
}

export function combineLocalDateAndMinutesPT(localDate: Date, minutes: number): Date {
  // localDate is a date in PT (midnight). Returns UTC instant for PT midnight + minutes
  const ptMidnight = set(toZonedTime(localDate, APP_TZ), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const ptDateTime = addMinutes(ptMidnight, minutes);
  return fromZonedTime(ptDateTime, APP_TZ);
} 