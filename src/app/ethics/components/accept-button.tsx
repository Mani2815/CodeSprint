'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

export function AcceptEthicsButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
      type="submit"
      disabled={pending}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? 'Recording acceptance...' : 'I accept and enter my dashboard'}
    </button>
  );
}
