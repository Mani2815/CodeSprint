'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Github, Loader2 } from 'lucide-react';

export function GithubConnectForm() {
  const router = useRouter();
  const [url, setUrl] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryUrl: url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to connect repository.');
      }

      toast({
        title: 'Repository Connected!',
        description: 'We are now analyzing your GitHub activity.',
      });
      
      router.refresh();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center text-muted-foreground">
        <Github className="mx-auto mb-4 h-10 w-10 opacity-50" />
        <p className="font-medium text-foreground">No repositories connected</p>
        <p className="mt-1 text-sm mb-6">
          Connect your project's GitHub repository to start analyzing your team's contributions.
        </p>

        <form onSubmit={onSubmit} className="flex max-w-md mx-auto items-center gap-2">
          <Input
            placeholder="https://github.com/owner/repository"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isSubmitting}
            className="flex-1"
            required
            type="url"
          />
          <Button type="submit" disabled={isSubmitting || !url}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Connect'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
