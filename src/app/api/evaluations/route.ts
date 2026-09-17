import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { listEvaluations, saveEvaluation } from '@/services/evaluation-service';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
const score = z.number().int().min(0).max(20);
const schema = z.object({
  teamId: z.string().min(1),
  checkpointId: z.string().min(1),
  innovation: score,
  technical: score,
  ui: score,
  documentation: score,
  githubScore: score,
  comments: z.string().max(3000).optional().nullable(),
  isPublished: z.boolean(),
});
export async function GET() {
  if (!(await requireAdminSession())) return apiError(401, 'Unauthorized.');
  try {
    return apiSuccess(await listEvaluations(await getActiveEventId(ACTIVE_EVENT_SLUG)));
  } catch (err) {
    return handleApiError(err);
  }
}
export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) return apiError(401, 'Unauthorized.');
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success)
    return apiError(400, parsed.error.issues[0]?.message ?? 'Invalid evaluation.');
  try {
    return apiSuccess(await saveEvaluation(parsed.data));
  } catch (err) {
    return handleApiError(err);
  }
}
