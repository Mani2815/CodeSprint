import { requireParticipantSession } from '@/lib/participant-auth';
import { getParticipantDashboardData } from '@/services/participant-dashboard-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { H1, Muted } from '@/components/shared/typography';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CalendarDays,
  Trophy,
  Activity,
  FolderKanban,
  Github,
  CheckCircle2,
  Clock,
  Megaphone,
} from 'lucide-react';

export default async function ParticipantDashboardPage() {
  const session = await requireParticipantSession();
  const data = await getParticipantDashboardData(session.user.participantId!);

  // Calculate current week progress (e.g. Week 2 of 4 = 50%)
  const weekMatch = data.currentWeek.match(/\d+/);
  const currentWeekNumber = weekMatch ? parseInt(weekMatch[0]) : 1;
  const progressPercent = (currentWeekNumber / 2) * 100;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      <div>
        <H1 className="text-3xl">Dashboard</H1>
        <Muted className="mt-2">Overview of your team's CodeSprint performance.</Muted>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Current Week */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Week</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.currentWeek} of Week 2</div>
            <Progress value={progressPercent} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Card 2: Overall Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {data.isRanked ? (
              <>
                <div className="text-2xl font-bold">{data.overallScore} Points</div>
                <p className="mt-1 text-xs text-muted-foreground">Across all checkpoints</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">Not available yet</div>
                <p className="mt-1 text-xs text-muted-foreground">Pending first evaluation</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Current Rank */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {data.isRanked ? (
              <>
                <div className="text-2xl font-bold">
                  {data.currentRank > 0 ? `Rank #${data.currentRank}` : 'Unranked'}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">On the public leaderboard</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">Not ranked yet</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Rankings will be available after the first weekly evaluation.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 4: Projects Submitted */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Submitted</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.projectsSubmitted} / 2</div>
            <p className="mt-1 text-xs text-muted-foreground">Weekly submissions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 5: GitHub Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" /> GitHub Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Commits</p>
                <p className="text-2xl font-semibold">{data.githubSummary.commits}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pull Requests</p>
                <p className="text-2xl font-semibold">{data.githubSummary.prs}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Last Synced:{' '}
              {data.githubSummary.lastSync ? data.githubSummary.lastSync.toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>

        {/* Card 6: Latest Faculty Evaluation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" /> Latest Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.latestEvaluation ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-semibold">{data.latestEvaluation.checkpoint.label}</p>
                  <Badge variant="success">Reviewed</Badge>
                </div>
                <div className="mb-2 text-3xl font-bold text-primary">
                  {data.latestEvaluation.total} / {data.latestEvaluation.checkpoint.maxScore ?? 100}
                </div>
                <Muted className="line-clamp-2">
                  {data.latestEvaluation.comments || 'No remarks provided.'}
                </Muted>
              </>
            ) : (
              <div className="flex h-full min-h-[100px] flex-col items-center justify-center text-muted-foreground">
                <p>No evaluations yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 7: Next Deadline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Next Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-sm text-muted-foreground">Submission closes in</p>
            <div className="text-3xl font-bold tabular-nums">
              {/* Note: In a real app, this would use a countdown timer component. We mock the display for now. */}
              {Math.max(
                0,
                Math.floor((data.nextDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              )}{' '}
              Days
            </div>
            <p className="mt-2 text-sm font-medium">{data.nextDeadline.toLocaleDateString()}</p>
          </CardContent>
        </Card>

        {/* Card 8: Latest Announcement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-warning" /> Latest Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.latestAnnouncement ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="line-clamp-1 font-semibold">{data.latestAnnouncement.title}</h4>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {data.latestAnnouncement.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {data.latestAnnouncement.content}
                </p>
              </div>
            ) : (
              <div className="flex h-full min-h-[100px] flex-col items-center justify-center text-muted-foreground">
                <p>No new announcements</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
