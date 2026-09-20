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
import { formatDateWithWeekday, getZonedDateString, getUtcStringFromZonedString } from '@/lib/date-utils';

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
    startDate: initialEvent.startDate ? new Date(initialEvent.startDate).toISOString() : '',
    endDate: initialEvent.endDate ? new Date(initialEvent.endDate).toISOString() : '',
    checkpoints: initialEvent.checkpoints.map((cp) => ({
      id: cp.id,
      label: cp.label,
      startDate: cp.startDate ? new Date(cp.startDate).toISOString() : '',
      endDate: cp.endDate ? new Date(cp.endDate).toISOString() : '',
      submissionOpenDate: cp.submissionOpenDate ? new Date(cp.submissionOpenDate).toISOString() : '',
      submissionCloseDate: cp.submissionCloseDate ? new Date(cp.submissionCloseDate).toISOString() : '',
    })),
  });

  const [formData, setFormData] = React.useState(getInitialFormData());
  const [isEditing, setIsEditing] = React.useState(false);

  const handleCancel = () => {
    setFormData(getInitialFormData());
    setIsEditing(false);
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'datetime-local') {
      const defaultTime = name.toLowerCase().includes('end') || name.toLowerCase().includes('close') ? 'end' : 'start';
      const utcValue = getUtcStringFromZonedString(value, formData.timezone, defaultTime) || '';
      setFormData((prev) => ({ ...prev, [name]: utcValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckpointChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => {
      const newCheckpoints = [...prev.checkpoints];
      if (type === 'datetime-local') {
        const defaultTime = name.toLowerCase().includes('end') || name.toLowerCase().includes('close') ? 'end' : 'start';
        const utcValue = getUtcStringFromZonedString(value, prev.timezone, defaultTime) || '';
        newCheckpoints[index] = { ...newCheckpoints[index], [name]: utcValue } as typeof newCheckpoints[0];
      } else {
        newCheckpoints[index] = { ...newCheckpoints[index], [name]: value } as typeof newCheckpoints[0];
      }
      return { ...prev, checkpoints: newCheckpoints };
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        timezone: formData.timezone,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        checkpoints: formData.checkpoints.map((cp) => ({
          id: cp.id,
          startDate: cp.startDate || null,
          endDate: cp.endDate || null,
          submissionOpenDate: cp.submissionOpenDate || null,
          submissionCloseDate: cp.submissionCloseDate || null,
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
                  <Input type="datetime-local" id="startDate" name="startDate" value={getZonedDateString(formData.startDate, formData.timezone)} onChange={handleEventChange} />
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
                  <Input type="datetime-local" id="endDate" name="endDate" value={getZonedDateString(formData.endDate, formData.timezone)} onChange={handleEventChange} />
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
                  <Input type="datetime-local" name="startDate" value={getZonedDateString(cp.startDate, formData.timezone)} onChange={(e) => handleCheckpointChange(i, e)} />
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
                  <Input type="datetime-local" name="endDate" value={getZonedDateString(cp.endDate, formData.timezone)} onChange={(e) => handleCheckpointChange(i, e)} />
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
                  <Input type="datetime-local" name="submissionOpenDate" value={getZonedDateString(cp.submissionOpenDate, formData.timezone)} onChange={(e) => handleCheckpointChange(i, e)} />
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
                  <Input type="datetime-local" name="submissionCloseDate" value={getZonedDateString(cp.submissionCloseDate, formData.timezone)} onChange={(e) => handleCheckpointChange(i, e)} />
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
