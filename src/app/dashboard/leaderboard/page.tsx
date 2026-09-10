import { requireParticipantSession } from '@/lib/participant-auth';
import { getLeaderboardView } from '@/services/leaderboard-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function LeaderboardPage() {
  const session = await requireParticipantSession();
  const participant = await prisma.participant.findUnique({
    where: { id: session.user.participantId! },
    select: { teamId: true },
  });

  const { checkpoints, ranked } = await getLeaderboardView(ACTIVE_EVENT_SLUG);

  const teamId = participant?.teamId;
  const teamRankIndex = ranked.findIndex((t) => t.id === teamId);
  const currentTeam = teamRankIndex !== -1 ? ranked[teamRankIndex] : null;
  const currentRank = teamRankIndex !== -1 ? teamRankIndex + 1 : 0;

  // Show top 10
  const top10 = ranked.slice(0, 10);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-8">
      <div>
        <H1 className="text-3xl">Leaderboard</H1>
        <Muted className="mt-2">Track your team's standing against the rest of the cohort.</Muted>
      </div>

      {currentTeam && (
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Current Rank</span>
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-4 text-3xl font-bold">#{currentRank}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Overall Points</span>
              </div>
              <p className="mt-4 text-3xl font-bold">{currentTeam.totalScore}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Weekly Points</span>
              </div>
              <p className="mt-4 text-3xl font-bold">
                {/* Find the most recent non-zero score for "weekly points" */}
                {Object.values(currentTeam.scoresByCheckpoint)
                  .reverse()
                  .find((v) => v > 0) ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Teams</CardTitle>
          <CardDescription>The current leaders of CodeSprint.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                  {checkpoints.map((cp) => (
                    <TableHead key={cp.id} className="text-right">
                      {cp.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top10.map((team, index) => {
                  const rank = index + 1;
                  const isCurrentTeam = team.id === teamId;

                  // Mock trend for now - in a real app this would compare against historical ranks
                  const trend = rank === 1 ? 'up' : rank === 2 ? 'down' : 'same';

                  return (
                    <TableRow
                      key={team.id}
                      className={cn(isCurrentTeam && 'bg-primary/10 hover:bg-primary/15')}
                    >
                      <TableCell className="text-center font-medium">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                      </TableCell>
                      <TableCell className={cn('font-medium', isCurrentTeam && 'text-primary')}>
                        {team.name}
                        {isCurrentTeam && <Badge className="ml-2 h-5 py-0 text-[10px]">You</Badge>}
                      </TableCell>
                      <TableCell className="text-center">
                        {trend === 'up' ? (
                          <ArrowUp className="mx-auto h-4 w-4 text-success" />
                        ) : trend === 'down' ? (
                          <ArrowDown className="text-destructive mx-auto h-4 w-4" />
                        ) : (
                          <Minus className="mx-auto h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      {checkpoints.map((cp) => {
                        const score = team.scoresByCheckpoint[cp.order] ?? '-';
                        return (
                          <TableCell key={cp.id} className="text-right">
                            {score}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right font-bold">{team.totalScore}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
