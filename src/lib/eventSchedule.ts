/**
 * Schedule rules shared by the event form and the admin API. Values are Pacific wall-clock
 * `yyyy-MM-ddTHH:mm` strings, which sort chronologically as plain strings.
 */
export type ScheduleInput = {
  startDateTime: string;
  doorsOpen?: string | null;
  endDateTime?: string | null;
  salesOpenAt: string;
  earlyBirdEndsAt: string;
  doorSalesOpenAt: string;
  salesCloseAt: string;
};

export type ScheduleField = keyof ScheduleInput;
export type ScheduleIssue = { field: ScheduleField; message: string };

const LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const REQUIRED: ScheduleField[] = ['startDateTime', 'salesOpenAt', 'earlyBirdEndsAt', 'doorSalesOpenAt', 'salesCloseAt'];

export function scheduleIssues(s: ScheduleInput): ScheduleIssue[] {
  const issues: ScheduleIssue[] = [];
  for (const f of REQUIRED) {
    const v = s[f];
    if (!v || !LOCAL.test(v)) issues.push({ field: f, message: 'Pick a date and time.' });
  }
  for (const f of ['doorsOpen', 'endDateTime'] as const) {
    const v = s[f];
    if (v && !LOCAL.test(v)) issues.push({ field: f, message: 'Pick a valid date and time.' });
  }
  if (issues.length) return issues;

  if (s.doorsOpen && s.doorsOpen > s.startDateTime) {
    issues.push({ field: 'doorsOpen', message: 'Doors must open at or before the show starts.' });
  }
  if (s.endDateTime && s.endDateTime <= s.startDateTime) {
    issues.push({ field: 'endDateTime', message: 'The show must end after it starts.' });
  }
  if (s.salesOpenAt >= s.earlyBirdEndsAt) {
    issues.push({ field: 'earlyBirdEndsAt', message: 'Early Bird must end after sales open.' });
  }
  if (s.earlyBirdEndsAt > s.doorSalesOpenAt) {
    issues.push({ field: 'doorSalesOpenAt', message: 'Door sales can’t open before Early Bird ends.' });
  }
  if (s.doorSalesOpenAt >= s.salesCloseAt) {
    issues.push({ field: 'salesCloseAt', message: 'Sales must close after door sales open.' });
  }
  return issues;
}
