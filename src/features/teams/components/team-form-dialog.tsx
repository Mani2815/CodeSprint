'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { teamNameSchema, type TeamNameInput } from '@/features/teams/validations/team-schema';
import type { TeamRow } from '@/features/teams/types';

interface TeamFormDialogProps {
  trigger: ReactNode;
  mode: 'create' | 'edit';
  team?: TeamRow;
}

export function TeamFormDialog({ trigger, mode, team }: TeamFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamNameInput>({
    resolver: zodResolver(teamNameSchema),
    defaultValues: { name: team?.name ?? '' },
  });

  async function onSubmit(values: TeamNameInput) {
    setServerError(null);
    setIsSubmitting(true);

    const url = mode === 'create' ? '/api/teams' : `/api/teams/${team!.id}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json().catch(() => ({}));
    setIsSubmitting(false);

    if (!res.ok) {
      setServerError(json.error ?? 'Something went wrong. Please try again.');
      return;
    }

    toast({
      title: mode === 'create' ? 'Team added' : 'Team updated',
      description: `"${values.name}" ${mode === 'create' ? 'was added to' : 'was updated on'} the leaderboard.`,
    });
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          reset({ name: team?.name ?? '' });
          setServerError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Team' : 'Edit Team'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new team to the CodeSprint leaderboard.'
              : 'Rename this team.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="e.g. Byte Bandits"
              autoFocus
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
          </div>

          {serverError && (
            <div
              role="alert"
              className="rounded-md border border-error/30 bg-error/10 px-3.5 py-2.5 text-sm text-error"
            >
              {serverError}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? 'Saving…' : mode === 'create' ? 'Add Team' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
