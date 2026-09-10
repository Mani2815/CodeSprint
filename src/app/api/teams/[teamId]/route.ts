import type { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { teamNameSchema } from '@/features/teams/validations/team-schema';
import { updateTeamName, deleteTeam } from '@/services/team-service';
import { logAdminAction } from '@/services/audit-service';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { teamId: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await requireAdminSession();
  if (!session) return apiError(401, 'You must be signed in as an organizer to do that.');

  const body = await req.json().catch(() => null);
  const parsed = teamNameSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message ?? 'Invalid team name.');
  }

  try {
    const oldTeam = await prisma.team.findUnique({ where: { id: params.teamId } });
    const team = await updateTeamName(params.teamId, parsed.data.name);
    await logAdminAction(session.user.id, 'UPDATE_TEAM', 'Team', params.teamId, oldTeam, team);
    return apiSuccess(team);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await requireAdminSession();
  if (!session) return apiError(401, 'You must be signed in as an organizer to do that.');

  try {
    const oldTeam = await prisma.team.findUnique({ where: { id: params.teamId } });
    await deleteTeam(params.teamId);
    await logAdminAction(session.user.id, 'DELETE_TEAM', 'Team', params.teamId, oldTeam, null);
    return apiSuccess({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}
