import type { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { teamNameSchema } from '@/features/teams/validations/team-schema';
import { createTeam } from '@/services/team-service';
import { getActiveEventId } from '@/services/event-service';
import { logAdminAction } from '@/services/audit-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return apiError(401, 'You must be signed in as an organizer to do that.');

  const body = await req.json().catch(() => null);
  const parsed = teamNameSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, parsed.error.issues[0]?.message ?? 'Invalid team name.');
  }

  try {
    const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
    const team = await createTeam(eventId, parsed.data.name);
    await logAdminAction(session.user.id, 'CREATE_TEAM', 'Team', team.id, null, team);
    return apiSuccess(team, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
