import { Checkpoint } from '@prisma/client';

/**
 * Returns a Date object representing the current local time
 * adjusted to match the event's timezone offset (e.g. "+05:30").
 */
export function getCurrentEventDate(timezoneOffset: string): Date {
  const nowUtc = new Date();

  // Extract the offset, e.g. "+05:30"
  const match = timezoneOffset.match(/([+-]\d{2}):(\d{2})$/);

  if (match && match[1] && match[2]) {
    const sign = match[1][0] === '+' ? 1 : -1;
    const hours = parseInt(match[1].slice(1), 10);
    const minutes = parseInt(match[2], 10);
    const offsetMinutes = sign * (hours * 60 + minutes);

    // Create a date shifted by the offset
    return new Date(nowUtc.getTime() + offsetMinutes * 60000);
  }

  // Fallback if no offset found
  return nowUtc;
}

/**
 * Checks if the current time falls within the checkpoint's configured submission window.
 * All DB dates are stored in absolute UTC, so we can just compare directly.
 */
export function isSubmissionOpen(checkpoint: Checkpoint): boolean {
  if (!checkpoint.submissionOpenDate || !checkpoint.submissionCloseDate) return false;
  const now = new Date();
  return now >= checkpoint.submissionOpenDate && now <= checkpoint.submissionCloseDate;
}

/**
 * Formats a given Date with the weekday and timezone context.
 * Example: "Friday — 18/09/2026, 12:00 PM"
 */
export function formatDateWithWeekday(date: Date | string, timezone: string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(parsedDate.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone || 'UTC',
    hour12: true,
  }).format(parsedDate).replace(',', ' —');
}
