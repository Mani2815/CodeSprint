import { TIE_BREAK_CHECKPOINT_ORDER } from '@/lib/constants';
import type { RankedTeam, TeamWithScores } from '@/types/leaderboard';

interface PreparedTeam {
  id: string;
  name: string;
  createdAt: Date;
  scoreMap: Record<number, number>;
  total: number;
  lastUpdated: Date | null;
}

function buildScoreMap(team: TeamWithScores): Record<number, number> {
  const map: Record<number, number> = {};
  for (const entry of team.scores) {
    map[entry.checkpointOrder] = entry.value;
  }
  return map;
}

function sumScores(scoreMap: Record<number, number>): number {
  return Object.values(scoreMap).reduce((sum, value) => sum + value, 0);
}

function latestUpdate(team: TeamWithScores): Date | null {
  if (team.scores.length === 0) return null;
  return team.scores.reduce<Date>(
    (latest, entry) => (entry.updatedAt > latest ? entry.updatedAt : latest),
    team.scores[0]!.updatedAt
  );
}

/**
 * Business rules (see README "Business Rules" section):
 *  1. Rank by highest Total Score.
 *  2. Ties broken by Checkpoint 2, then 1 (higher wins).
 *  3. Still tied → the team created earlier ranks higher.
 *  4. A team with no score recorded for a given checkpoint counts as 0 for
 *     that checkpoint (both in the total and in tie-break comparisons) —
 *     this keeps the leaderboard well-defined before every checkpoint has
 *     been scored, e.g. mid-event.
 */
function compare(a: PreparedTeam, b: PreparedTeam): number {
  if (a.total !== b.total) return b.total - a.total;

  for (const checkpointOrder of TIE_BREAK_CHECKPOINT_ORDER) {
    const aValue = a.scoreMap[checkpointOrder] ?? 0;
    const bValue = b.scoreMap[checkpointOrder] ?? 0;
    if (aValue !== bValue) return bValue - aValue;
  }

  return a.createdAt.getTime() - b.createdAt.getTime();
}

/**
 * Sorts teams into final leaderboard order and assigns 1-based ranks.
 * Because the tie-break chain always terminates in `createdAt` (which is
 * unique per team), no two teams can ever end up with an identical
 * position — every team gets a distinct rank.
 */
export function rankTeams(teams: TeamWithScores[]): RankedTeam[] {
  const prepared: PreparedTeam[] = teams.map((team) => {
    const scoreMap = buildScoreMap(team);
    return {
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      scoreMap,
      total: sumScores(scoreMap),
      lastUpdated: latestUpdate(team),
    };
  });

  prepared.sort(compare);

  return prepared.map((team, index) => ({
    rank: index + 1,
    id: team.id,
    name: team.name,
    totalScore: team.total,
    scoresByCheckpoint: team.scoreMap,
    lastUpdated: team.lastUpdated,
    createdAt: team.createdAt,
  }));
}
