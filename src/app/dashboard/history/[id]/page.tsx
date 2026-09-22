import { requireParticipantSession } from '@/lib/participant-auth';
import { getSubmissionDetail } from '@/services/submission-service';
import { notFound } from 'next/navigation';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Github,
  Globe,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Video,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const session = await requireParticipantSession();
  const submission = await getSubmissionDetail(params.id);

  if (!submission) {
    notFound();
  }

  if (
    submission.teamId !== session.user.participantId! &&
    submission.team.participants.every((p) => p.id !== session.user.participantId)
  ) {
    // Basic authorization check: verify the participant is on the team that owns the submission.
    // In a real app we'd want a more robust check in the service or here.
    // Assuming `getSubmissionDetail` returns team.participants, we check if the user is in it.
    const isMember = submission.team.participants.some((p) => p.id === session.user.participantId);
    if (!isMember) {
      notFound();
    }
  }

  const evaluation = submission.team.evaluations.find(
    (e) => e.checkpointId === submission.checkpointId
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-2">
            {submission.checkpoint.label}
          </Badge>
          <H1 className="text-3xl">{submission.projectTitle}</H1>
          <Muted className="mt-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Submitted on {submission.submittedAt.toLocaleDateString()}
          </Muted>
        </div>
        {evaluation ? (
          <Badge variant="success" className="px-3 py-1 text-sm">
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Reviewed
          </Badge>
        ) : (
          <Badge variant="warning" className="px-3 py-1 text-sm">
            <AlertCircle className="mr-1.5 h-4 w-4" /> Pending Review
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Problem Statement
                </h4>
                <p className="whitespace-pre-wrap text-sm">{submission.problemStatement}</p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Description</h4>
                <p className="whitespace-pre-wrap text-sm">{submission.projectDescription}</p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Key Features</h4>
                <p className="whitespace-pre-wrap text-sm">{submission.keyFeatures}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Tech Stack</h4>
                  <p className="text-sm">{submission.technologyStack}</p>
                </div>
                {submission.aiToolsUsed && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground">AI Tools</h4>
                    <p className="text-sm">{submission.aiToolsUsed}</p>
                  </div>
                )}
              </div>

              {submission.additionalNotes && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                    Additional Notes
                  </h4>
                  <p className="whitespace-pre-wrap rounded-md border border-border/50 bg-surface/50 p-4 text-sm">
                    {submission.additionalNotes}
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex flex-wrap gap-4">
                <Button variant="outline" asChild>
                  <a href={submission.repositoryUrl} target="_blank" rel="noreferrer">
                    <Github className="mr-2 h-4 w-4" /> Repository
                  </a>
                </Button>
                {submission.demoVideoUrl && (
                  <Button variant="outline" asChild>
                    <a href={submission.demoVideoUrl} target="_blank" rel="noreferrer">
                      <Video className="mr-2 h-4 w-4" /> Demo Video
                    </a>
                  </Button>
                )}
                {submission.demoUrl && (
                  <Button variant="outline" asChild>
                    <a href={submission.demoUrl} target="_blank" rel="noreferrer">
                      <Globe className="mr-2 h-4 w-4" /> Live Demo
                    </a>
                  </Button>
                )}
                {submission.presentationUrl && (
                  <Button variant="outline" asChild>
                    <a href={submission.presentationUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Presentation
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Faculty Evaluation</CardTitle>
              <CardDescription>Marks and feedback provided by the organizers.</CardDescription>
            </CardHeader>
            <CardContent>
              {evaluation ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <span className="text-lg font-semibold">Total Score</span>
                    <span className="text-2xl font-bold text-primary">
                      {evaluation.total}{' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {submission.checkpoint.maxScore ?? 0}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-6 text-sm">
                    {/* Project Evaluation */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-muted-foreground mb-3 text-xs uppercase tracking-wider">
                        Project Evaluation — 70
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between rounded-md bg-surface/30 p-3">
                          <span className="text-muted-foreground">Problem Understanding</span>
                          <span className="font-medium">{evaluation.problemUnderstanding}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-surface/30 p-3">
                          <span className="text-muted-foreground">Innovation & Creativity</span>
                          <span className="font-medium">{evaluation.innovation}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-surface/30 p-3">
                          <span className="text-muted-foreground">Functionality & Completeness</span>
                          <span className="font-medium">{evaluation.functionality}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-surface/30 p-3">
                          <span className="text-muted-foreground">Technical Implementation</span>
                          <span className="font-medium">{evaluation.technical}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-surface/30 p-3">
                          <span className="text-muted-foreground">UI/UX & Design</span>
                          <span className="font-medium">{evaluation.ui}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-surface/30 p-3">
                          <span className="text-muted-foreground">Documentation & Code Quality</span>
                          <span className="font-medium">{evaluation.documentation}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-surface/30 p-3">
                          <span className="text-muted-foreground">Impact, Practicality & SDG</span>
                          <span className="font-medium">{evaluation.impact}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* GitHub & Team */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary mb-3 text-xs uppercase tracking-wider">
                        GitHub Activity & Team Contribution — 20
                      </h4>
                      <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 p-3">
                        <span className="font-semibold text-primary">GitHub & Collaboration</span>
                        <span className="font-bold text-primary">{evaluation.githubScore}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Timeliness & Consistency */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-muted-foreground mb-3 text-xs uppercase tracking-wider">
                        Timely Submission & Consistency — 10
                      </h4>
                      <div className="flex items-center justify-between rounded-md bg-surface/30 p-3">
                        <span className="text-muted-foreground">Timeliness</span>
                        <span className="font-medium">{evaluation.timelySubmission}</span>
                      </div>
                    </div>
                  </div>

                  {evaluation.comments && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Remarks</h4>
                      <p className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-primary-foreground">
                        {evaluation.comments}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="mx-auto mb-3 h-8 w-8 opacity-50" />
                  <p>Your submission is pending review.</p>
                  <p className="mt-1 text-sm">Check back later for marks and feedback.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              {submission.verificationStatus === 'QUEUED' ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary opacity-50" />
                  <p className="font-medium text-foreground">GitHub Analysis Running...</p>
                  <p className="mt-1 text-sm">We are analyzing your repository commits.</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <a href="">Refresh Page</a>
                  </Button>
                </div>
              ) : submission.analytics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Commits</span>
                    <span className="font-semibold">{submission.analytics.totalCommits}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pull Requests</span>
                    <span className="font-semibold">{submission.analytics.pullRequestCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Days</span>
                    <span className="font-semibold">{submission.analytics.activeDays}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Repo Health</span>
                    <Badge
                      variant={
                        submission.analytics.repositoryHealth === 'Healthy' ? 'success' : 'warning'
                      }
                    >
                      {submission.analytics.repositoryHealth}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      variant={
                        submission.verificationStatus === 'VERIFIED' ? 'success' : 'secondary'
                      }
                    >
                      {submission.verificationStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Analytics generated at submission time.
                  </p>
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Analytics not available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
