'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Event, Checkpoint } from '@prisma/client';
import { formatDateWithWeekday } from '@/lib/date-utils';

type CheckpointConfig = Checkpoint & {
  label: string;
};

type EventConfig = Event & {
  checkpoints: CheckpointConfig[];
};

export function ScheduleManager({ initialEvent }: { initialEvent: EventConfig }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = React.useState(false);
  const getInitialFormData = () => ({
    timezone: initialEvent.timezone || '+05:30',
    startDate: initialEvent.startDate ? new Date(initialEvent.startDate).toISOString().slice(0, 16) : '',
    endDate: initialEvent.endDate ? new Date(initialEvent.endDate).toISOString().slice(0, 16) : '',
    checkpoints: initialEvent.checkpoints.map((cp) => ({
      id: cp.id,
      label: cp.label,
      startDate: cp.startDate ? new Date(cp.startDate).toISOString().slice(0, 16) : '',
      endDate: cp.endDate ? new Date(cp.endDate).toISOString().slice(0, 16) : '',
      submissionOpenDate: cp.submissionOpenDate ? new Date(cp.submissionOpenDate).toISOString().slice(0, 16) : '',
      submissionCloseDate: cp.submissionCloseDate ? new Date(cp.submissionCloseDate).toISOString().slice(0, 16) : '',
    })),
  });

  const [formData, setFormData] = React.useState(getInitialFormData());
  const [isEditing, setIsEditing] = React.useState(false);

  const handleCancel = () => {
    setFormData(getInitialFormData());
    setIsEditing(false);
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckpointChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newCheckpoints = [...prev.checkpoints];
      newCheckpoints[index] = { ...newCheckpoints[index], [name]: value } as typeof newCheckpoints[0];
      return { ...prev, checkpoints: newCheckpoints };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        timezone: formData.timezone,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        checkpoints: formData.checkpoints.map((cp) => ({
          id: cp.id,
          startDate: cp.startDate ? new Date(cp.startDate).toISOString() : null,
          endDate: cp.endDate ? new Date(cp.endDate).toISOString() : null,
          submissionOpenDate: cp.submissionOpenDate ? new Date(cp.submissionOpenDate).toISOString() : null,
          submissionCloseDate: cp.submissionCloseDate ? new Date(cp.submissionCloseDate).toISOString() : null,
        })),
      };

      const res = await fetch('/api/admin/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update schedule');
      }

      toast({ title: 'Schedule Updated', description: 'The event schedule has been successfully updated.' });
      setIsEditing(false);
      router.refresh();
    } catch (error: unknown) {
      toast({ variant: 'destructive', title: 'Error', description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex justify-end">
        {!isEditing && (
          <Button type="button" onClick={() => setIsEditing(true)}>
            Edit Schedule
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Configuration</CardTitle>
          <CardDescription>Global event settings and timezone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone Offset (e.g. +05:30, -04:00)</Label>
            {isEditing ? (
              <Input id="timezone" name="timezone" value={formData.timezone} onChange={handleEventChange} required />
            ) : (
              <p className="text-sm font-medium">{formData.timezone || 'Not set'}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Event Start Date</Label>
              {isEditing ? (
                <>
                  <Input type="datetime-local" id="startDate" name="startDate" value={formData.startDate} onChange={handleEventChange} />
                  {formData.startDate && <p className="text-xs text-muted-foreground">{formatDateWithWeekday(formData.startDate, formData.timezone)}</p>}
                </>
              ) : (
                <p className="text-sm font-medium">{formData.startDate ? formatDateWithWeekday(formData.startDate, formData.timezone) : 'Not set'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Event End Date</Label>
              {isEditing ? (
                <>
                  <Input type="datetime-local" id="endDate" name="endDate" value={formData.endDate} onChange={handleEventChange} />
                  {formData.endDate && <p className="text-xs text-muted-foreground">{formatDateWithWeekday(formData.endDate, formData.timezone)}</p>}
                </>
              ) : (
                <p className="text-sm font-medium">{formData.endDate ? formatDateWithWeekday(formData.endDate, formData.timezone) : 'Not set'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {formData.checkpoints.map((cp, i: number) => (
        <Card key={cp.id}>
          <CardHeader>
            <CardTitle>{cp.label} Schedule</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              {isEditing ? (
                <>
                  <Input type="datetime-local" name="startDate" value={cp.startDate} onChange={(e) => handleCheckpointChange(i, e)} />
                  {cp.startDate && <p className="text-xs text-muted-foreground">{formatDateWithWeekday(cp.startDate, formData.timezone)}</p>}
                </>
              ) : (
                <p className="text-sm font-medium">{cp.startDate ? formatDateWithWeekday(cp.startDate, formData.timezone) : 'Not set'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              {isEditing ? (
                <>
                  <Input type="datetime-local" name="endDate" value={cp.endDate || ''} onChange={(e) => handleCheckpointChange(i, e)} />
                  {cp.endDate && <p className="text-xs text-muted-foreground">{formatDateWithWeekday(cp.endDate, formData.timezone)}</p>}
                </>
              ) : (
                <p className="text-sm font-medium">{cp.endDate ? formatDateWithWeekday(cp.endDate, formData.timezone) : 'Not set'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Submission Window Opens</Label>
              {isEditing ? (
                <>
                  <Input type="datetime-local" name="submissionOpenDate" value={cp.submissionOpenDate} onChange={(e) => handleCheckpointChange(i, e)} />
                  {cp.submissionOpenDate && <p className="text-xs text-muted-foreground">{formatDateWithWeekday(cp.submissionOpenDate, formData.timezone)}</p>}
                </>
              ) : (
                <p className="text-sm font-medium">{cp.submissionOpenDate ? formatDateWithWeekday(cp.submissionOpenDate, formData.timezone) : 'Not set'}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Submission Deadline</Label>
              {isEditing ? (
                <>
                  <Input type="datetime-local" name="submissionCloseDate" value={cp.submissionCloseDate} onChange={(e) => handleCheckpointChange(i, e)} />
                  {cp.submissionCloseDate && <p className="text-xs text-muted-foreground">{formatDateWithWeekday(cp.submissionCloseDate, formData.timezone)}</p>}
                </>
              ) : (
                <p className="text-sm font-medium">{cp.submissionCloseDate ? formatDateWithWeekday(cp.submissionCloseDate, formData.timezone) : 'Not set'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="lg" disabled={isSaving} onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={isSaving}>
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
          </Button>
        </div>
      )}
    </form>
  );
}
