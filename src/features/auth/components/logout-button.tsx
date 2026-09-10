'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export function LogoutButton(props: Omit<ButtonProps, 'onClick'>) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isSigningOut}
      onClick={async () => {
        setIsSigningOut(true);
        await signOut({ callbackUrl: ROUTES.PARTICIPANT_LOGIN });
      }}
      {...props}
    >
      <LogOut />
      {isSigningOut ? 'Signing out…' : 'Logout'}
    </Button>
  );
}
