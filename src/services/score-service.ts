import { prisma } from '@/lib/prisma';
import { SCORE_LIMITS } from '@/lib/constants';

export class InvalidScoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidScoreError';
  }
}

export interface ScoreInput {
  checkpointId: string;
  value: number;
}

function assertValidScore(value: number) {
  if (!Number.isInteger(value)) {
    throw new InvalidScoreError('Scores must be whole numbers.');
  }
  if (value < SCORE_LIMITS.MIN) {
    throw new InvalidScoreError('Negative scores are not allowed.');
  }
  if (value > SCORE_LIMITS.MAX) {
    throw new InvalidScoreError(`Scores cannot exceed ${SCORE_LIMITS.MAX}.`);
  }
}

/**
 * Saves every checkpoint score for a single team in one transaction, so a
 * partial save (e.g. checkpoint 2 fails validation) never leaves checkpoint
 * 1 & 3 written while 2 is missing. `Score.updatedAt` is bumped by Prisma's
 * `@updatedAt` automatically, which is what the leaderboard's "Last
 * Updated" column reads from.
 */
export async function saveTeamScores(teamId: string, scores: ScoreInput[]) {
  scores.forEach((s) => assertValidScore(s.value));

  return prisma.$transaction(
    scores.map((s) =>
      prisma.score.upsert({
        where: { teamId_checkpointId: { teamId, checkpointId: s.checkpointId } },
        create: { teamId, checkpointId: s.checkpointId, value: s.value },
        update: { value: s.value },
      })
    )
  );
}

export interface AdminTeamScoreRow {
  teamId: string;
  teamName: string;
  scores: Array<{ checkpointId: string; value: number }>;
  lastUpdated: Date | null;
}

/**
 * Unlike `leaderboard-service.getTeamsWithScores` (which keys scores by
 * checkpoint *order* for ranking), this keys by checkpoint *id* — what the
 * score-entry grid needs to submit `PATCH`-style upserts back to `/api/scores`.
 */
export async function listTeamsWithScores(eventId: string): Promise<AdminTeamScoreRow[]> {
  const teams = await prisma.team.findMany({
    where: { eventId },
    include: { scores: true },
    orderBy: { createdAt: 'asc' },
  });

  return teams.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    scores: team.scores.map((s) => ({ checkpointId: s.checkpointId, value: s.value })),
    lastUpdated:
      team.scores.length === 0
        ? null
        : team.scores.reduce<Date>(
            (latest, s) => (s.updatedAt > latest ? s.updatedAt : latest),
            team.scores[0]!.updatedAt
          ),
  }));
}
