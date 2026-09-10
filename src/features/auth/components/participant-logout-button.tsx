'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export function ParticipantLogoutButton() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOut({ callbackUrl: ROUTES.PARTICIPANT_LOGIN });
      }}
      aria-label="Sign out"
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">{pending ? 'Signing out…' : 'Sign out'}</span>
    </Button>
  );
}
