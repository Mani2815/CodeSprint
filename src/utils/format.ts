const RELATIVE_UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: 'year', seconds: 31536000 },
  { unit: 'month', seconds: 2592000 },
  { unit: 'day', seconds: 86400 },
  { unit: 'hour', seconds: 3600 },
  { unit: 'minute', seconds: 60 },
];

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "3 minutes ago", "2 hours ago", falling back to "just now" for anything under a minute. */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  for (const { unit, seconds } of RELATIVE_UNITS) {
    if (absSeconds >= seconds) {
      return relativeFormatter.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return 'just now';
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

export function formatScore(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
