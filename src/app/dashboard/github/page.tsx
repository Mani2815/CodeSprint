import { requireParticipantSession } from '@/lib/participant-auth';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GitCommitHorizontal, GitPullRequest, Calendar, Activity } from 'lucide-react';
import { GithubConnectForm } from '@/features/dashboard/components/github-connect-form';
import { GithubSyncButton } from '@/features/dashboard/components/github-sync-button';
import { GithubRemoveButton } from '@/features/dashboard/components/github-remove-button';

export default async function GithubAnalyticsPage() {
  const session = await requireParticipantSession();
  const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);

  const participant = await prisma.participant.findUnique({
    where: { id: session.user.participantId! },
    include: {
      team: {
        include: {
          participants: true,
          submissions: {
            include: { analytics: true, checkpoint: true },
            orderBy: { checkpoint: { order: 'desc' } },
            take: 1,
          },
        },
      },
    },
  });

  if (!participant?.teamId) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
        <H1 className="text-3xl">GitHub Analytics</H1>
        <div className="rounded-lg border border-dashed bg-surface/30 p-8 text-center">
          <p className="font-medium">You are not assigned to a team yet.</p>
        </div>
      </div>
    );
  }

  const team = participant.team!;
  const latestSubmission = team.submissions[0];

  const activeCheckpoint = await prisma.checkpoint.findFirst({
    where: { eventId, isActive: true },
    orderBy: { order: 'asc' },
  });

  const hasActiveSubmission = latestSubmission?.checkpointId === activeCheckpoint?.id;
  const showConnectForm = !latestSubmission || (activeCheckpoint && !hasActiveSubmission);

  // If showing connect form, we do not show old analytics
  if (showConnectForm) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-8">
        <div>
          <H1 className="text-3xl">GitHub Analytics</H1>
          <Muted className="mt-2">Insights into your team's collaboration and codebase health.</Muted>
        </div>
        <GithubConnectForm />
      </div>
    );
  }

  // Read stats from the single source of truth (SubmissionAnalytics)
  const analytics = latestSubmission?.analytics;
  const metrics = (analytics?.memberMetrics as Array<{
    username: string;
    commits: number;
    pullRequests: number;
    activeDays: number;
    lastCommitAt: string | null;
    contributionPercentage: number;
  }>) || [];

  // Map member stats
  const memberStats = team.participants
    .map((p) => {
      const metric = metrics.find(
        (m) => m.username.toLowerCase() === p.githubUsername.toLowerCase()
      );
      return { 
        ...p, 
        totalCommits: metric?.commits || 0, 
        totalPRs: metric?.pullRequests || 0 
      };
    })
    .sort((a, b) => b.totalCommits - a.totalCommits); // Sort by highest commits

  const totalTeamCommits = analytics?.totalCommits || 0;
  const totalTeamPRs = analytics?.pullRequestCount || 0;
  const topContributor = memberStats[0];

  const recentActivities = metrics
    .filter((m) => m.commits > 0 || m.pullRequests > 0)
    .sort((a, b) => {
      const dateA = a.lastCommitAt ? new Date(a.lastCommitAt).getTime() : 0;
      const dateB = b.lastCommitAt ? new Date(b.lastCommitAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <H1 className="text-3xl">GitHub Analytics</H1>
          <Muted className="mt-2">Insights into your team's collaboration and codebase health.</Muted>
        </div>
        {latestSubmission && (
          <div className="flex items-center gap-4">
            <Muted className="text-xs">
              Last synced: {latestSubmission.analytics?.syncedAt ? new Date(latestSubmission.analytics.syncedAt).toLocaleString() : 'Never'}
            </Muted>
            {latestSubmission.isDraft && (
              <GithubRemoveButton />
            )}
            <GithubSyncButton />
          </div>
        )}
      </div>

      <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Commits</span>
                  <GitCommitHorizontal className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-4 text-3xl font-bold">{totalTeamCommits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Pull Requests</span>
                  <GitPullRequest className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-4 text-3xl font-bold">{totalTeamPRs}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Contributors</span>
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <p className="mt-4 text-3xl font-bold">{team.participants.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Repo Health</span>
                  <Badge
                    variant={
                      latestSubmission.analytics?.repositoryHealth === 'Healthy'
                        ? 'success'
                        : 'secondary'
                    }
                  >
                    {latestSubmission.analytics?.repositoryHealth ?? 'Unknown'}
                  </Badge>
                </div>
                <p className="mt-4 truncate text-sm font-medium">
                  {latestSubmission.repositoryUrl.replace('https://github.com/', '')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Contribution Share</CardTitle>
                <CardDescription>Breakdown of commits across the team.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-6">
                  {memberStats.map((member, index) => {
                    const percentage =
                      totalTeamCommits > 0
                        ? Math.round((member.totalCommits / totalTeamCommits) * 100)
                        : 0;
                    const isTop = topContributor?.id === member.id && member.totalCommits > 0;

                    return (
                      <div key={member.id} className="space-y-3 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                        <div className="text-sm font-semibold text-muted-foreground">Participant {index + 1}</div>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={member.avatarUrl ?? undefined} />
                          <AvatarFallback>
                            {member.githubUsername.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <p className="flex items-center gap-2 truncate text-sm font-medium">
                              {member.name || member.githubUsername}
                              {isTop && (
                                <Badge
                                  variant="outline"
                                  className="h-5 border-primary/20 bg-primary/10 px-1.5 py-0 text-[10px] text-primary"
                                >
                                  Top
                                </Badge>
                              )}
                            </p>
                            <span className="text-xs font-semibold">{percentage}%</span>
                          </div>
                          <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{member.totalCommits} commits</span>
                            <span>{member.totalPRs} PRs</span>
                          </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Commit history from latest submission.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {recentActivities.length > 0 ? (
                  <div className="relative ml-3 space-y-6 border-l border-border">
                    {recentActivities.map((activity) => (
                      <div key={activity.username} className="relative pl-6">
                        <div className="absolute left-[-6px] top-1.5 h-3 w-3 rounded-full border border-primary bg-primary/20" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {activity.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              in {latestSubmission.checkpoint.label}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">
                            Pushed {activity.commits} commits and opened {activity.pullRequests} PRs.
                          </p>
                          <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {activity.lastCommitAt
                              ? new Date(activity.lastCommitAt).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    No recent activity found.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
    </div>
  );
}
