import { requireParticipantSession } from '@/lib/participant-auth';
import { getTeamSubmissions } from '@/services/submission-service';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Lock,
  XCircle,
  Github,
  Loader2,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const session = await requireParticipantSession();
  const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
  const participantId = session.user.participantId!;

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    select: { teamId: true },
  });

  if (!participant?.teamId) {
    return (
      <div className="mx-auto max-w-4xl p-6 lg:p-8">
        <H1>Submission History</H1>
        <Muted className="mt-2">You must be assigned to a team to view submissions.</Muted>
      </div>
    );
  }

  const teamId = participant.teamId;

  const submissions = await getTeamSubmissions(teamId);
  const evaluations = await prisma.evaluation.findMany({
    where: { teamId },
    include: { checkpoint: true },
  });

  const checkpoints = await prisma.checkpoint.findMany({
    where: { eventId },
    orderBy: { order: 'asc' },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
      <div>
        <H1>Submission History</H1>
        <Muted className="mt-2">View your team's past submissions and evaluations.</Muted>
      </div>

      <div className="grid gap-6">
        {checkpoints.map((checkpoint, index) => {
          const submission = submissions.find((s) => s.checkpointId === checkpoint.id);
          const evaluation = evaluations.find((e) => e.checkpointId === checkpoint.id);
          
          const activeIndex = checkpoints.findIndex((c) => c.isActive);
          const isLocked =
            !checkpoint.isActive && !submission && (activeIndex === -1 || index > activeIndex);

          return (
            <Card key={checkpoint.id} className={isLocked ? 'opacity-60' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">{checkpoint.label}</CardTitle>
                <div>
                  {submission ? (
                    <Badge variant="success" className="flex items-center gap-1 uppercase">
                      Submitted
                    </Badge>
                  ) : checkpoint.isActive ? (
                    <Badge variant="warning" className="flex items-center gap-1 uppercase">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  ) : isLocked ? (
                    <Badge variant="secondary" className="flex items-center gap-1 uppercase">
                      <Lock className="h-3 w-3" /> Locked
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 uppercase bg-destructive/10 text-destructive"
                    >
                      <XCircle className="h-3 w-3" /> Missed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {submission ? (
                  <div className="space-y-6">
                    {/* Project Info */}
                    <div>
                      <p className="font-semibold text-foreground">Project submitted</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {submission.submittedAt.toLocaleString(undefined, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      <div className="mt-2">
                        <a
                          href={submission.repositoryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          <Github className="h-4 w-4" />
                          {submission.repositoryUrl.replace(/https?:\/\/(www\.)?github\.com\//, '')}
                        </a>
                      </div>
                    </div>

                    {/* GitHub Analysis */}
                    <div>
                      <p className="font-semibold text-foreground mb-2">GitHub Analysis</p>
                      {submission.verificationStatus === 'QUEUED' ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin text-warning" />
                          <span>⟳ Analysis in progress...</span>
                        </div>
                      ) : submission.analytics ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-sm text-success font-medium">
                            <CheckCircle2 className="h-4 w-4" /> ✓ Completed
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              <strong className="text-foreground">
                                {submission.analytics.totalCommits}
                              </strong>{' '}
                              Commits
                            </span>
                            <span>
                              <strong className="text-foreground">
                                {submission.analytics.pullRequestCount}
                              </strong>{' '}
                              PRs
                            </span>
                            <span>
                              <strong className="text-foreground">
                                {Array.isArray(submission.analytics.contributors)
                                  ? submission.analytics.contributors.length
                                  : 0}
                              </strong>{' '}
                              Contributors
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive" />
                          Analysis failed or not available.
                        </p>
                      )}
                    </div>

                    {/* Evaluation */}
                    <div>
                      <p className="font-semibold text-foreground mb-2">Evaluation</p>
                      {evaluation ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-sm text-success font-medium">
                            <CheckCircle2 className="h-4 w-4" /> Reviewed
                          </div>
                          <p className="text-2xl font-bold text-primary">
                            {evaluation.total}{' '}
                            <span className="text-sm font-normal text-muted-foreground">
                              / {evaluation.checkpoint.maxScore ?? 200}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Pending faculty review</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                      <Button asChild>
                        <Link href={`/dashboard/history/${submission.id}`}>
                          {evaluation ? 'View Results' : 'View Submission'}{' '}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    {checkpoint.isActive ? (
                      <div className="space-y-4">
                        <Muted>No submission</Muted>
                        <Button variant="default" size="sm" asChild>
                          <Link href="/dashboard/submission">Submit Now</Link>
                        </Button>
                      </div>
                    ) : (
                      <Muted>No project was submitted for this week.</Muted>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
