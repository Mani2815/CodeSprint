'use client';

import { useState } from 'react';
import { Github, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function ManualSyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  async function handleSync() {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/admin/github-sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();

      toast({
        title: 'Sync Complete',
        description: `Successfully synchronized ${data.summary.synced} submissions.`,
      });
    } catch {
      toast({
        title: 'Sync Failed',
        description: 'An error occurred while communicating with GitHub.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing} variant="secondary" className="w-full">
      {isSyncing ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <Github className="mr-2 size-4" />
      )}
      {isSyncing ? 'Syncing...' : 'Trigger Sync'}
    </Button>
  );
}
