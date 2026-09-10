import type { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { saveScoresSchema } from '@/features/scores/validations/score-schema';
import { saveTeamScores } from '@/services/score-service';
import { getLeaderboard } from '@/services/leaderboard-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { logAdminAction } from '@/services/audit-service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return apiError(401, 'You must be signed in as an organizer to do that.');

  const body = await req.json().catch(() => null);
  const parsed = saveScoresSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message ?? 'Invalid score data.');
  }

  try {
    const oldScores = await prisma.score.findMany({ where: { teamId: parsed.data.teamId } });
    await saveTeamScores(parsed.data.teamId, parsed.data.scores);
    await logAdminAction(
      session.user.id,
      'UPDATE_SCORE',
      'TeamScores',
      parsed.data.teamId,
      oldScores,
      parsed.data.scores
    );

    // Recalculate ranking immediately so the response can tell the
    // organizer exactly what changed — "Update totals / Recalculate
    // ranking / Update Last Updated timestamp" all happen as one save.
    const leaderboard = await getLeaderboard(ACTIVE_EVENT_SLUG);
    const updatedTeam = leaderboard.find((t) => t.id === parsed.data.teamId);

    return apiSuccess({
      team: updatedTeam ?? null,
      leaderboardSize: leaderboard.length,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
