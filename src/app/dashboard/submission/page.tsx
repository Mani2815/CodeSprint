import { requireParticipantSession } from '@/lib/participant-auth';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { SubmissionForm } from '@/features/dashboard/components/submission-form';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Lock } from 'lucide-react';

export default async function SubmissionPage() {
  const session = await requireParticipantSession();
  const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);

  // Check if participant has a team
  const participant = await prisma.participant.findUnique({
    where: { id: session.user.participantId! },
    select: { teamId: true },
  });

  const allCheckpoints = await prisma.checkpoint.findMany({
    where: { eventId },
    orderBy: { order: 'asc' },
  });

  const activeCheckpoints = allCheckpoints.filter((c) => c.isActive);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
      <div>
        <H1 className="text-3xl">Weekly Submission</H1>
        <Muted className="mt-2">Submit your weekly deliverable for faculty evaluation.</Muted>
      </div>

      {!participant?.teamId ? (
        <div className="rounded-lg border border-dashed bg-surface/30 p-8 text-center">
          <p className="font-medium">You are not assigned to a team yet.</p>
          <Muted className="mt-1">
            An organizer must approve your registration and assign you to a team before you can
            submit projects.
          </Muted>
        </div>
      ) : activeCheckpoints.length > 0 ? (
        <SubmissionForm activeCheckpoints={activeCheckpoints} />
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-dashed bg-surface/30 p-12 text-center">
            <CalendarDays className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <h3 className="text-lg font-medium">No Active Submission Window</h3>
            <Muted className="mx-auto mt-2 max-w-md">
              There is currently no active sprint week accepting submissions. Check the schedule
              below for upcoming deadlines.
            </Muted>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Submission Schedule</CardTitle>
              <CardDescription>All phases of the CodeSprint event.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allCheckpoints.map((checkpoint) => (
                  <div
                    key={checkpoint.id}
                    className="flex items-center justify-between rounded-lg border bg-surface/50 p-4"
                  >
                    <div>
                      <p className="font-medium">{checkpoint.label}</p>
                    </div>
                    <div>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Locked
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
