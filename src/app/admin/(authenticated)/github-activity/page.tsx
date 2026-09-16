import { requireAdminPageSession } from '@/lib/auth-guards';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GitCommitHorizontal, GitPullRequest, Calendar, Activity, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { ManualSyncButton } from '@/features/dashboard/components/manual-sync-button';
import Link from 'next/link';

export const metadata = {
  title: 'GitHub Activity | Admin Dashboard',
};

export default async function AdminGithubActivityPage({
  searchParams,
}: {
  searchParams: { checkpointId?: string };
}) {
  await requireAdminPageSession();
  const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);

  const checkpoints = await prisma.checkpoint.findMany({
    where: { eventId },
    orderBy: { order: 'asc' },
  });

  const activeCheckpointId =
    searchParams.checkpointId || checkpoints.find((c) => c.isActive)?.id || checkpoints[0]?.id;

  const teams = await prisma.team.findMany({
    where: { eventId },
    include: {
      participants: true,
      submissions: {
        where: { checkpointId: activeCheckpointId },
        include: { analytics: true, checkpoint: true },
        take: 1,
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <H1 className="text-3xl font-bold tracking-tight">GitHub Activity</H1>
          <Muted className="mt-2">
            View GitHub activity across all teams for the selected checkpoint.
          </Muted>
        </div>
        <div className="flex items-center gap-4">
          <ManualSyncButton />
        </div>
      </div>

      {checkpoints.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {checkpoints.map((checkpoint) => (
            <Link
              key={checkpoint.id}
              href={`?checkpointId=${checkpoint.id}`}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${
                activeCheckpointId === checkpoint.id ? 'bg-accent text-accent-foreground border-primary' : ''
              }`}
            >
              {checkpoint.label}
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {teams.map((team) => {
          const submission = team.submissions[0];
          const analytics = submission?.analytics;
          
          if (!submission) {
            return (
              <Card key={team.id}>
                <CardHeader>
                  <CardTitle>{team.name}</CardTitle>
                  <CardDescription>
                    {team.participants.map(p => p.name || p.githubUsername).join(', ') || 'No participants'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-dashed bg-surface/30 p-8 text-center text-sm text-muted-foreground">
                    No repository connected for this checkpoint.
                  </div>
                </CardContent>
              </Card>
            );
          }

          const metrics = (analytics?.memberMetrics as Array<{
            username: string;
            commits: number;
            pullRequests: number;
            activeDays: number;
            lastCommitAt: string | null;
            contributionPercentage: number;
          }>) || [];

          // Separate matched and unmatched contributors
          const matchedStats = team.participants
            .map((p) => {
              const metric = metrics.find(
                (m) => m.username.toLowerCase() === p.githubUsername.toLowerCase()
              );
              return {
                ...p,
                totalCommits: metric?.commits || 0,
                totalPRs: metric?.pullRequests || 0,
                lastCommitAt: metric?.lastCommitAt || null,
              };
            })
            .sort((a, b) => b.totalCommits - a.totalCommits);

          const unmatchedMetrics = metrics.filter(
            (m) =>
              !team.participants.some(
                (p) => p.githubUsername.toLowerCase() === m.username.toLowerCase()
              )
          );

          const totalTeamCommits = analytics?.totalCommits || 0;
          const totalTeamPRs = analytics?.pullRequestCount || 0;

          return (
            <Card key={team.id}>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {team.name}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <LinkIcon className="h-4 w-4" />
                      <a 
                        href={submission.repositoryUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {submission.repositoryUrl.replace('https://github.com/', '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={analytics?.repositoryHealth === 'Healthy' ? 'success' : 'secondary'}>
                      {analytics?.repositoryHealth ?? 'Unknown'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Last synced: {analytics?.syncedAt ? new Date(analytics.syncedAt).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6 grid gap-4 grid-cols-3 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <GitCommitHorizontal className="h-4 w-4" /> Commits
                    </div>
                    <div className="mt-1 text-2xl font-bold">{totalTeamCommits}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <GitPullRequest className="h-4 w-4" /> Pull Requests
                    </div>
                    <div className="mt-1 text-2xl font-bold">{totalTeamPRs}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Activity className="h-4 w-4" /> Contributors
                    </div>
                    <div className="mt-1 text-2xl font-bold">{Object.keys(analytics?.contributors || {}).length}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {matchedStats.map((member, index) => {
                    const percentage = totalTeamCommits > 0 ? Math.round((member.totalCommits / totalTeamCommits) * 100) : 0;
                    return (
                      <div key={member.id} className="space-y-3">
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
                                <span className="text-muted-foreground font-normal">(@{member.githubUsername})</span>
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
                              <div className="flex gap-3">
                                <span>{member.totalCommits} commits</span>
                                <span>{member.totalPRs} PRs</span>
                              </div>
                              {member.lastCommitAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(member.lastCommitAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {unmatchedMetrics.length > 0 && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="text-sm font-semibold text-muted-foreground mb-4">Other Contributors</div>
                      <div className="space-y-4">
                        {unmatchedMetrics.map((unmatched) => {
                           const percentage = totalTeamCommits > 0 ? Math.round((unmatched.commits / totalTeamCommits) * 100) : 0;
                           return (
                            <div key={unmatched.username} className="flex items-center gap-4 opacity-75">
                              <Avatar className="h-8 w-8 border border-border">
                                <AvatarFallback>{unmatched.username.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between">
                                  <p className="truncate text-xs font-medium">
                                    @{unmatched.username}
                                  </p>
                                  <span className="text-[10px] font-semibold">{percentage}%</span>
                                </div>
                                <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
                                  <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                  <div className="flex gap-2">
                                    <span>{unmatched.commits} commits</span>
                                    <span>{unmatched.pullRequests} PRs</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                           );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {teams.length === 0 && (
          <div className="rounded-lg border border-dashed bg-surface/30 p-8 text-center text-sm text-muted-foreground">
            No teams found for this event.
          </div>
        )}
      </div>
    </div>
  );
}
