import { prisma } from '@/lib/prisma';
import { rankTeams } from '@/utils/ranking';
import { getActiveEventId } from '@/services/event-service';
import { getCheckpointsForEvent } from '@/services/checkpoint-service';
import type { RankedTeam, TeamWithScores } from '@/types/leaderboard';

/**
 * Fetches every team for an event along with their scores, shaped for the
 * ranking algorithm. Shared by the public leaderboard and the admin score
 * management screen (Phase 8) so both read from one query shape.
 */
export async function getTeamsWithScores(
  eventId: string
): Promise<TeamWithScores[]> {
  const teams = await prisma.team.findMany({
    where: { eventId },
    include: {
      scores: {
        include: { checkpoint: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    createdAt: team.createdAt,
    scores: team.scores.map((score) => ({
      checkpointOrder: score.checkpoint.order,
      value: score.value,
      updatedAt: score.updatedAt,
    })),
  }));
}

export async function getLeaderboard(eventSlug: string): Promise<RankedTeam[]> {
  const eventId = await getActiveEventId(eventSlug);
  const teams = await getTeamsWithScores(eventId);
  return rankTeams(teams);
}

/**
 * Everything the public leaderboard page needs in one round trip: the
 * event's checkpoints (for column headers/order) plus the ranked teams.
 */
export async function getLeaderboardView(eventSlug: string) {
  const eventId = await getActiveEventId(eventSlug);
  const [checkpoints, teams] = await Promise.all([
    getCheckpointsForEvent(eventId),
    getTeamsWithScores(eventId),
  ]);
  return { checkpoints, ranked: rankTeams(teams) };
}

/** Case-insensitive substring search by team name, applied after ranking so rank numbers stay stable. */
export function filterLeaderboard(ranked: RankedTeam[], query: string): RankedTeam[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return ranked;
  return ranked.filter((team) => team.name.toLowerCase().includes(normalized));
}
