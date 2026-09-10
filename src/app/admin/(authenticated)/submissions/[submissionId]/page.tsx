import { notFound } from 'next/navigation';
import { H1, Muted } from '@/components/shared/typography';
import { getSubmissionDetail } from '@/services/submission-service';
import { SubmissionRefreshButton } from '@/features/submissions/components/submission-refresh-button';
import { EvaluationForm } from '@/features/evaluations/components/evaluation-form';
import {
  calculateSuggestedGithubScore,
  SubmissionAnalyticsSnapshot,
} from '@/services/github-sync-service';
import { Progress } from '@/components/ui/progress';

export const dynamic = 'force-dynamic';

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: { submissionId: string };
}) {
  const submission = await getSubmissionDetail(params.submissionId);
  if (!submission) notFound();

  const evaluation = submission.team.evaluations.find(
    (item) => item.checkpointId === submission.checkpointId
  );

  const analyticsSnapshot = submission.analytics as unknown as SubmissionAnalyticsSnapshot | null;
  const suggestedGithubScore = analyticsSnapshot
    ? calculateSuggestedGithubScore(analyticsSnapshot)
    : 0;

  const metrics = Array.isArray(submission.analytics?.memberMetrics)
    ? (submission.analytics?.memberMetrics as Array<{
        username: string;
        commits: number;
        pullRequests: number;
        contributionPercentage: number;
      }>)
    : [];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <H1 className="text-3xl">{submission.projectTitle}</H1>
          <Muted className="mt-1">
            {submission.team.name} · {submission.checkpoint.label}
          </Muted>
        </div>
        <SubmissionRefreshButton submissionId={submission.id} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Details & Analytics */}
        <div className="space-y-8">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-3 text-lg font-semibold">Submission Details</h2>
            <p className="mb-4 whitespace-pre-wrap text-sm text-muted-foreground">
              {submission.projectDescription}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                className="text-sm font-medium text-primary hover:underline"
                href={submission.repositoryUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open GitHub Repository
              </a>
              {submission.demoUrl && (
                <a
                  className="text-sm font-medium text-primary hover:underline"
                  href={submission.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Demo
                </a>
              )}
              {submission.presentationUrl && (
                <a
                  className="text-sm font-medium text-primary hover:underline"
                  href={submission.presentationUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View LinkedIn Post
                </a>
              )}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-3 text-lg font-semibold">GitHub Analytics</h2>

            <div className="mb-6 rounded-md bg-muted/50 p-4">
              <p className="mb-1 text-sm font-medium">
                Status:{' '}
                <span className="font-bold">
                  {submission.verificationStatus.replaceAll('_', ' ')}
                </span>
              </p>
              {analyticsSnapshot && (
                <p className="text-sm text-muted-foreground">
                  Last commit:{' '}
                  {analyticsSnapshot.lastCommitAt
                    ? new Date(analyticsSnapshot.lastCommitAt).toLocaleString()
                    : 'N/A'}
                </p>
              )}
            </div>

            {analyticsSnapshot ? (
              <>
                <div className="mb-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-background p-4">
                    <Muted className="text-xs uppercase tracking-wider">Total Commits</Muted>
                    <p className="mt-1 text-3xl font-bold">{analyticsSnapshot.totalCommits}</p>
                  </div>
                  <div className="rounded-lg border bg-background p-4">
                    <Muted className="text-xs uppercase tracking-wider">Pull Requests</Muted>
                    <p className="mt-1 text-3xl font-bold">{analyticsSnapshot.pullRequestCount}</p>
                  </div>
                  <div className="rounded-lg border bg-background p-4">
                    <Muted className="text-xs uppercase tracking-wider">Active Days</Muted>
                    <p className="mt-1 text-3xl font-bold">{analyticsSnapshot.activeDays}</p>
                  </div>
                  <div className="rounded-lg border bg-background p-4">
                    <Muted className="text-xs uppercase tracking-wider">Repo Health</Muted>
                    <p className="mt-2 text-xl font-bold">{analyticsSnapshot.repositoryHealth}</p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-medium">Team Contributions</h3>
                  <div className="space-y-4">
                    {metrics.map((member) => (
                      <div key={member.username} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">@{member.username}</span>
                          <span className="text-muted-foreground">
                            {member.contributionPercentage}%
                          </span>
                        </div>
                        <Progress value={member.contributionPercentage} className="h-2" />
                        <p className="text-right text-xs text-muted-foreground">
                          {member.commits} commits · {member.pullRequests} PRs
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <Muted className="py-8 text-center">Analysis is not available.</Muted>
            )}
          </section>
        </div>

        {/* Right Column: Faculty Evaluation */}
        <div>
          <section className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="mb-6 border-b pb-3 text-lg font-semibold">Faculty Evaluation</h2>
            <EvaluationForm
              teamId={submission.teamId}
              checkpointId={submission.checkpointId}
              initialData={evaluation}
              suggestedGithubScore={suggestedGithubScore}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
