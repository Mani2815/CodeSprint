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
import { eventSchema, type EventInput } from '@/features/events/validations/event-schema';

interface EventFormDialogProps {
  trigger: ReactNode;
  mode: 'create' | 'edit';
  eventData?: { id: string; name: string; slug: string };
}

export function EventFormDialog({ trigger, mode, eventData }: EventFormDialogProps) {
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
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: { name: eventData?.name ?? '', slug: eventData?.slug ?? '' },
  });

  async function onSubmit(values: EventInput) {
    setServerError(null);
    setIsSubmitting(true);

    const url = mode === 'create' ? '/api/events' : `/api/events/${eventData!.id}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

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
      title: mode === 'create' ? 'Event Created' : 'Event Updated',
      description: `"${values.name}" has been ${mode === 'create' ? 'created' : 'updated'}.`,
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
          reset({ name: eventData?.name ?? '', slug: eventData?.slug ?? '' });
          setServerError(null);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Event' : 'Edit Event'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new CodeSprint event.'
              : 'Modify the details of this event.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              placeholder="e.g. CodeSprint 2026"
              autoFocus
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-slug">Event Slug (URL friendly)</Label>
            <Input
              id="event-slug"
              placeholder="e.g. codesprint-2026"
              aria-invalid={Boolean(errors.slug)}
              {...register('slug')}
            />
            {errors.slug && <p className="text-sm text-error">{errors.slug.message}</p>}
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
              {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create Event' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
