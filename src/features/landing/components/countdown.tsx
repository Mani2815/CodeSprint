'use client';

import { AnimatedCountdown } from '@/components/ui/animated-countdown';

export function Countdown({ targetDate }: { targetDate: string }) {
  if (!targetDate) return null;
  return <AnimatedCountdown targetDate={targetDate} variant="modern" size="sm" />;
}
