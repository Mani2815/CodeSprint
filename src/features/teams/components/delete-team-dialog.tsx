'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { TeamRow } from '@/features/teams/types';

interface DeleteTeamDialogProps {
  team: TeamRow;
  trigger: ReactNode;
}

export function DeleteTeamDialog({ team, trigger }: DeleteTeamDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleDelete() {
    setIsDeleting(true);
    const res = await fetch(`/api/teams/${team.id}`, { method: 'DELETE' });
    const json = await res.json().catch(() => ({}));
    setIsDeleting(false);

    if (!res.ok) {
      toast({
        title: 'Could not delete team',
        description: json.error ?? 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Team deleted',
      description: `"${team.name}" and its checkpoint scores were removed.`,
    });
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{team.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes the team and every checkpoint score recorded for them. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="animate-spin" />}
            {isDeleting ? 'Deleting…' : 'Delete Team'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
