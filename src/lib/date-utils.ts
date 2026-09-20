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

/**
 * Converts a UTC Date or ISO string into a local datetime string (YYYY-MM-DDThh:mm)
 * that correctly corresponds to the event's timezone offset.
 * This is used to display the correct date/time in `<input type="datetime-local">`.
 */
export function getZonedDateString(date: Date | string | null | undefined, timezoneOffset: string): string {
  if (!date) return '';
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(parsedDate.getTime())) return '';

  const match = timezoneOffset.match(/([+-]\d{2}):(\d{2})$/);
  let offsetMinutes = 0;
  if (match && match[1] && match[2]) {
    const sign = match[1][0] === '+' ? 1 : -1;
    const hours = parseInt(match[1].slice(1), 10);
    const minutes = parseInt(match[2], 10);
    offsetMinutes = sign * (hours * 60 + minutes);
  } else if (timezoneOffset === 'Z') {
    offsetMinutes = 0;
  }

  const zonedTime = new Date(parsedDate.getTime() + offsetMinutes * 60000);
  return zonedTime.toISOString().slice(0, 16);
}

/**
 * Parses a local datetime string (YYYY-MM-DDThh:mm) from a datetime-local input
 * and converts it back to a UTC ISO string, accurately interpreting it in the
 * context of the given event timezone offset.
 * Also applies default times for Start (00:00) and End/Close (23:59) if the
 * time portion happens to be omitted.
 */
export function getUtcStringFromZonedString(
  localDateTime: string | null | undefined,
  timezoneOffset: string,
  defaultTime: 'start' | 'end'
): string | null {
  if (!localDateTime) return null;

  let dateTimeStr = localDateTime;
  
  // If the browser only supplied the date (YYYY-MM-DD)
  if (dateTimeStr.length === 10) {
    dateTimeStr += defaultTime === 'start' ? 'T00:00' : 'T23:59';
  }

  const offset = timezoneOffset === 'Z' ? 'Z' : timezoneOffset;
  const isoString = `${dateTimeStr}:00${offset}`;
  
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return null;
  
  return d.toISOString();
}
