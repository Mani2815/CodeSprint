import { requireAdminPageSession } from '@/lib/auth-guards';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG, EVENT_SCHEDULE } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  GitCommitHorizontal,
  GitPullRequest,
  Calendar,
  Activity,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
              className={`focus-visible:ring-ring border-input hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 ${
                activeCheckpointId === checkpoint.id
                  ? 'bg-accent text-accent-foreground border-primary'
                  : ''
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
                    {team.participants.map((p) => p.name || p.githubUsername).join(', ') ||
                      'No participants'}
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

          const rawMetrics = analytics?.memberMetrics as Record<string, unknown> | null;
          const commitHistory =
            (rawMetrics?.commits as Array<{ sha: string; author: string; timestamp: string }>) ||
            [];
          const metrics = (
            Array.isArray(rawMetrics) ? rawMetrics : rawMetrics?.members || []
          ) as Array<{
            username: string;
            commits: number;
            pullRequests: number;
            activeDays: number;
            lastCommitAt: string | null;
            contributionPercentage: number;
          }>;

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
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">{team.name}</CardTitle>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <LinkIcon className="h-4 w-4" />
                      <a
                        href={submission.repositoryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        {submission.repositoryUrl.replace('https://github.com/', '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={analytics?.repositoryHealth === 'Healthy' ? 'success' : 'secondary'}
                    >
                      {analytics?.repositoryHealth ?? 'Unknown'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Last synced:{' '}
                      {analytics?.syncedAt
                        ? new Date(analytics.syncedAt).toLocaleString()
                        : 'Never'}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <GitCommitHorizontal className="h-4 w-4" /> Commits
                    </div>
                    <div className="mt-1 text-2xl font-bold">{totalTeamCommits}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <GitPullRequest className="h-4 w-4" /> Pull Requests
                    </div>
                    <div className="mt-1 text-2xl font-bold">{totalTeamPRs}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <Activity className="h-4 w-4" /> Contributors
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {Object.keys(analytics?.contributors || {}).length}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {matchedStats.map((member, index) => {
                    const percentage =
                      totalTeamCommits > 0
                        ? Math.round((member.totalCommits / totalTeamCommits) * 100)
                        : 0;
                    return (
                      <div key={member.id} className="space-y-3">
                        <div className="text-sm font-semibold text-muted-foreground">
                          Participant {index + 1}
                        </div>
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
                                <span className="font-normal text-muted-foreground">
                                  (@{member.githubUsername})
                                </span>
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
                    <div className="border-t border-border/50 pt-4">
                      <div className="mb-4 text-sm font-semibold text-muted-foreground">
                        Other Contributors
                      </div>
                      <div className="space-y-4">
                        {unmatchedMetrics.map((unmatched) => {
                          const percentage =
                            totalTeamCommits > 0
                              ? Math.round((unmatched.commits / totalTeamCommits) * 100)
                              : 0;
                          return (
                            <div
                              key={unmatched.username}
                              className="flex items-center gap-4 opacity-75"
                            >
                              <Avatar className="h-8 w-8 border border-border">
                                <AvatarFallback>
                                  {unmatched.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
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

                  <div className="mt-6 border-t border-border/50 pt-4">
                    <div className="mb-4 text-sm font-semibold text-muted-foreground">
                      Daily Commits
                    </div>
                    <div className="space-y-2">
                      {(() => {
                        const deadlineIso =
                          submission.checkpoint.order === 2
                            ? EVENT_SCHEDULE.WEEK_2_DEADLINE
                            : EVENT_SCHEDULE.WEEK_1_DEADLINE;
                        const tzMatch = deadlineIso.match(/([+-]\d{2}):(\d{2})$/);
                        let offsetMinutes = 0;
                        if (tzMatch && tzMatch[1] && tzMatch[2]) {
                          const sign = tzMatch[1][0] === '+' ? 1 : -1;
                          offsetMinutes =
                            sign *
                            (parseInt(tzMatch[1].slice(1), 10) * 60 + parseInt(tzMatch[2], 10));
                        }
                        const fridayTime = new Date(
                          new Date(deadlineIso).getTime() + offsetMinutes * 60000
                        ).getTime();

                        const days = [
                          {
                            name: 'Monday',
                            date: new Date(fridayTime - 4 * 86400000).toISOString().slice(0, 10),
                          },
                          {
                            name: 'Tuesday',
                            date: new Date(fridayTime - 3 * 86400000).toISOString().slice(0, 10),
                          },
                          {
                            name: 'Wednesday',
                            date: new Date(fridayTime - 2 * 86400000).toISOString().slice(0, 10),
                          },
                          {
                            name: 'Thursday',
                            date: new Date(fridayTime - 1 * 86400000).toISOString().slice(0, 10),
                          },
                          { name: 'Friday', date: new Date(fridayTime).toISOString().slice(0, 10) },
                        ];

                        if (!analytics) {
                          return (
                            <div className="text-sm text-muted-foreground">Data unavailable</div>
                          );
                        }

                        const dailyStats: Record<
                          string,
                          { total: number; participants: Record<string, number>; other: number }
                        > = {};
                        commitHistory.forEach((commit) => {
                          const date = new Date(commit.timestamp);
                          if (Number.isNaN(date.valueOf())) return;

                          const local = new Date(date.getTime() + offsetMinutes * 60000);
                          const localDateStr = local.toISOString().slice(0, 10);

                          if (!dailyStats[localDateStr]) {
                            dailyStats[localDateStr] = { total: 0, participants: {}, other: 0 };
                          }

                          dailyStats[localDateStr].total += 1;

                          const login = commit.author;
                          if (
                            team.participants.some((p) => p.githubUsername.toLowerCase() === login)
                          ) {
                            dailyStats[localDateStr].participants[login] =
                              (dailyStats[localDateStr].participants[login] || 0) + 1;
                          } else {
                            dailyStats[localDateStr].other += 1;
                          }
                        });

                        return (
                          <div className="overflow-hidden rounded-md border bg-background">
                            <table className="w-full text-sm">
                              <tbody className="divide-y">
                                {days.map((day) => {
                                  const stats = dailyStats[day.date];
                                  const total = stats?.total || 0;
                                  return (
                                    <tr key={day.name} className="hover:bg-muted/50">
                                      <td className="w-32 p-3 font-medium">{day.name}</td>
                                      <td className="w-28 p-3 text-muted-foreground">
                                        {total} commits
                                      </td>
                                      <td className="p-3">
                                        <div className="flex flex-wrap gap-x-6 gap-y-1">
                                          {team.participants.map((p) => {
                                            const login = p.githubUsername.toLowerCase();
                                            const count = stats?.participants?.[login] || 0;
                                            return (
                                              <span key={p.id} className="text-muted-foreground">
                                                <span className="font-medium text-foreground">
                                                  {p.name || p.githubUsername}:
                                                </span>{' '}
                                                {count}
                                              </span>
                                            );
                                          })}
                                          {(stats?.other ?? 0) > 0 && (
                                            <span className="text-muted-foreground">
                                              <span className="font-medium text-foreground">
                                                Other contributors:
                                              </span>{' '}
                                              {stats?.other}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
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
