'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [justRefreshed, setJustRefreshed] = useState(false);

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
    setJustRefreshed(true);
    setTimeout(() => setJustRefreshed(false), 1500);
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isPending}>
      <RefreshCw className={cn('size-4', isPending && 'animate-spin')} />
      {justRefreshed && !isPending ? 'Updated' : 'Refresh'}
    </Button>
  );
}
