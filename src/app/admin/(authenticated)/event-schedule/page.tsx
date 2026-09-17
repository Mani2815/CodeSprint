import { requireAdminPageSession } from '@/lib/auth-guards';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { H1, Muted } from '@/components/shared/typography';
import { ScheduleManager } from './schedule-manager';

export const metadata = {
  title: 'Event Schedule | Admin Dashboard',
};

export default async function AdminSchedulePage() {
  await requireAdminPageSession();
  const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
  
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      checkpoints: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!event) return null;

  const activeCheckpoint = event.checkpoints.find(c => c.isActive);
  
  let currentActiveWeek = 'None';
  let submissionStatus = 'Closed';
  let upcomingDeadline = 'N/A';

  if (activeCheckpoint) {
    currentActiveWeek = activeCheckpoint.label;
    const now = new Date();
    
    if (activeCheckpoint.submissionOpenDate && activeCheckpoint.submissionCloseDate) {
      if (now >= activeCheckpoint.submissionOpenDate && now <= activeCheckpoint.submissionCloseDate) {
        submissionStatus = 'Open';
      }
    }
    
    if (activeCheckpoint.submissionCloseDate) {
      upcomingDeadline = activeCheckpoint.submissionCloseDate.toLocaleString();
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <H1 className="text-3xl font-bold tracking-tight">Event Schedule</H1>
        <Muted className="mt-2">
          Manage dates, deadlines, and timezones for the entire event and weekly checkpoints.
        </Muted>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <p className="text-sm font-medium text-muted-foreground">Active Week</p>
          <p className="text-2xl font-bold mt-2">{currentActiveWeek}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <p className="text-sm font-medium text-muted-foreground">Submissions</p>
          <p className={`text-2xl font-bold mt-2 ${submissionStatus === 'Open' ? 'text-green-500' : 'text-muted-foreground'}`}>{submissionStatus}</p>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <p className="text-sm font-medium text-muted-foreground">Next Deadline</p>
          <p className="text-sm font-bold mt-2">{upcomingDeadline}</p>
        </div>
      </div>

      <ScheduleManager initialEvent={event} />
    </div>
  );
}
