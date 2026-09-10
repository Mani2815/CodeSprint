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
import {
  checkpointSchema,
  updateCheckpointSchema,
  type CheckpointInput,
  type UpdateCheckpointInput,
} from '@/features/events/validations/event-schema';

interface CheckpointFormDialogProps {
  trigger: ReactNode;
  mode: 'create' | 'edit';
  eventId?: string;
  checkpoint?: { id: string; label: string; order: number; maxScore: number | null };
}

export function CheckpointFormDialog({
  trigger,
  mode,
  eventId,
  checkpoint,
}: CheckpointFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const schema = mode === 'create' ? checkpointSchema : updateCheckpointSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckpointInput | UpdateCheckpointInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventId: eventId ?? '',
      label: checkpoint?.label ?? '',
      order: checkpoint?.order ?? 1,
      maxScore: checkpoint?.maxScore ?? undefined,
    } as CheckpointInput | UpdateCheckpointInput,
  });

  async function onSubmit(values: CheckpointInput | UpdateCheckpointInput) {
    setServerError(null);
    setIsSubmitting(true);

    const url = mode === 'create' ? '/api/checkpoints' : `/api/checkpoints/${checkpoint!.id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    const payload = {
      ...values,
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    setIsSubmitting(false);

    if (!res.ok) {
      setServerError(json.error ?? 'Something went wrong. Please try again.');
      return;
    }

    toast({
      title: mode === 'create' ? 'Checkpoint Created' : 'Checkpoint Updated',
      description: `"${values.label}" has been ${mode === 'create' ? 'created' : 'updated'}.`,
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
          reset({
            eventId: eventId ?? '',
            label: checkpoint?.label ?? '',
            order: checkpoint?.order ?? 1,
            maxScore: checkpoint?.maxScore ?? undefined,
          } as CheckpointInput | UpdateCheckpointInput);
          setServerError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Checkpoint' : 'Edit Checkpoint'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new evaluation checkpoint.'
              : 'Modify the details of this checkpoint.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cp-label">Label</Label>
            <Input
              id="cp-label"
              placeholder="e.g. Technical Evaluation"
              autoFocus
              aria-invalid={Boolean(errors.label)}
              {...register('label')}
            />
            {errors.label && <p className="text-sm text-error">{errors.label.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-order">Order</Label>
            <Input
              id="cp-order"
              type="number"
              placeholder="e.g. 1"
              aria-invalid={Boolean(errors.order)}
              {...register('order')}
            />
            {errors.order && <p className="text-sm text-error">{errors.order.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-maxscore">Max Score (Optional)</Label>
            <Input
              id="cp-maxscore"
              type="number"
              placeholder="e.g. 1000"
              aria-invalid={Boolean(errors.maxScore)}
              {...register('maxScore')}
            />
            {errors.maxScore && <p className="text-sm text-error">{errors.maxScore.message}</p>}
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
              {isSubmitting ? 'Saving…' : mode === 'create' ? 'Add Checkpoint' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
