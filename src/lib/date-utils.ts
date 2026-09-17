import { EVENT_START_DATE_ISO } from '@/lib/constants';

/**
 * Returns a Date object representing the current local time
 * adjusted to match the event's timezone offset as specified in EVENT_START_DATE_ISO.
 */
export function getCurrentEventDate(): Date {
  const nowUtc = new Date();

  // Extract the offset from EVENT_START_DATE_ISO, e.g. "+05:30"
  const match = EVENT_START_DATE_ISO.match(/([+-]\d{2}):(\d{2})$/);

  if (match && match[1] && match[2]) {
    const sign = match[1][0] === '+' ? 1 : -1;
    const hours = parseInt(match[1].slice(1), 10);
    const minutes = parseInt(match[2], 10);
    const offsetMinutes = sign * (hours * 60 + minutes);

    // Create a date shifted by the offset, so getUTCDay() matches local day
    return new Date(nowUtc.getTime() + offsetMinutes * 60000);
  }

  // Fallback if no offset found
  return nowUtc;
}

/**
 * Checks if the current day in the event timezone is Friday.
 */
export function isEventFriday(): boolean {
  // getUTCDay() returns 0 for Sunday, 5 for Friday.
  // We use UTC methods because we manually shifted the time in getCurrentEventDate()
  return getCurrentEventDate().getUTCDay() === 5;
}
