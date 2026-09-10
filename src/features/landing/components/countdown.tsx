'use client';

import { EVENT_START_DATE_ISO } from '@/lib/constants';
import { AnimatedCountdown } from '@/components/ui/animated-countdown';

/**
 * Countdown placeholder per the brief. Reads the target date from
 * `EVENT_START_DATE_ISO` (env-configurable) so organizers can set the real
 * CodeSprint date without a code change.
 */
export function Countdown() {
  return <AnimatedCountdown targetDate={EVENT_START_DATE_ISO} variant="modern" size="sm" />;
}
