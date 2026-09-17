'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

export function GithubSyncButton() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = React.useState(false);

  async function handleSync() {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/dashboard/github/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync GitHub data.');
      }
      toast({
        title: 'Sync Successful',
        description: 'GitHub data has been refreshed.',
      });
      router.refresh();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync GitHub Data'}
    </Button>
  );
}
