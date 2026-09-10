'use client';

import { signIn } from 'next-auth/react';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export function ParticipantLoginButton() {
  return (
    <button
      onClick={() => signIn('github', { callbackUrl: ROUTES.DASHBOARD })}
      className="group mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
    >
      Continue with GitHub{' '}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
}
