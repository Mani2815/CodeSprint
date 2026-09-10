'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Plus, Archive, Settings2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EventFormDialog } from './event-form-dialog';
import { CheckpointFormDialog } from './checkpoint-form-dialog';
import { useToast } from '@/hooks/use-toast';

interface EventListProps {
  events: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
    checkpoints?: Array<{ id: string; label: string; order: number; maxScore: number | null }>;
  }>;
}

export function EventList({ events }: EventListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleActivate = async (eventId: string) => {
    const res = await fetch(`/api/events/${eventId}/activate`, { method: 'POST' });
    if (res.ok) {
      toast({ title: 'Event activated' });
      router.refresh();
    }
  };

  const handleArchive = async (eventId: string, isActive: boolean) => {
    if (isActive) {
      toast({ title: 'Cannot archive an active event', variant: 'destructive' });
      return;
    }
    const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    if (res.ok) {
      toast({ title: 'Event archived' });
      router.refresh();
    }
  };

  const handleCheckpointDelete = async (checkpointId: string) => {
    if (!confirm('Are you sure you want to delete this checkpoint? This may delete scores.'))
      return;
    const res = await fetch(`/api/checkpoints/${checkpointId}`, { method: 'DELETE' });
    if (res.ok) {
      toast({ title: 'Checkpoint deleted' });
      router.refresh();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Events</h2>
        <EventFormDialog
          mode="create"
          trigger={
            <Button size="sm">
              <Plus className="mr-2 size-4" />
              New Event
            </Button>
          }
        />
      </div>

      <div className="overflow-hidden rounded-md border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell className="text-muted-foreground">{event.slug}</TableCell>
                <TableCell>
                  {event.isActive ? (
                    <Badge
                      variant="default"
                      className="border-green-500/20 bg-green-500/10 text-green-500 hover:bg-green-500/20"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Archived</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(event.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  {!event.isActive && (
                    <Button variant="outline" size="sm" onClick={() => handleActivate(event.id)}>
                      Activate
                    </Button>
                  )}
                  <EventFormDialog
                    mode="edit"
                    eventData={event}
                    trigger={
                      <Button variant="ghost" size="icon" title="Edit Event">
                        <Settings2 className="size-4" />
                      </Button>
                    }
                  />
                  {!event.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Archive Event"
                      onClick={() => handleArchive(event.id, event.isActive)}
                    >
                      <Archive className="size-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {events
        .filter((e) => e.isActive)
        .map((activeEvent) => (
          <div key={`cp-${activeEvent.id}`} className="space-y-4 pt-8">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-medium">Checkpoints for {activeEvent.name}</h3>
              <CheckpointFormDialog
                mode="create"
                eventId={activeEvent.id}
                trigger={
                  <Button size="sm" variant="secondary">
                    <Plus className="mr-2 size-4" />
                    Add Checkpoint
                  </Button>
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeEvent.checkpoints?.map((cp) => (
                <div key={cp.id} className="space-y-2 rounded-md border bg-surface p-4">
                  <div className="flex items-start justify-between">
                    <div className="text-lg font-medium">{cp.label}</div>
                    <Badge variant="outline">Order: {cp.order}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Max Score: {cp.maxScore ?? 'None'}
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <CheckpointFormDialog
                      mode="edit"
                      eventId={activeEvent.id}
                      checkpoint={cp}
                      trigger={
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error"
                      onClick={() => handleCheckpointDelete(cp.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!activeEvent.checkpoints || activeEvent.checkpoints.length === 0) && (
                <div className="col-span-full rounded-md border border-dashed p-8 text-center text-muted-foreground">
                  No checkpoints found for this event.
                </div>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
