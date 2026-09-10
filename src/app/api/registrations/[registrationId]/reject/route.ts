import { z } from 'zod';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { rejectRegistration } from '@/services/registration-service';
export async function PATCH(req: Request, { params }: { params: { registrationId: string } }) {
  if (!(await requireAdminSession())) return apiError(401, 'Unauthorized.');
  const parsed = z
    .object({ reason: z.string().trim().min(2).max(1000) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError(400, 'A rejection reason is required.');
  try {
    return apiSuccess(await rejectRegistration(params.registrationId, parsed.data.reason));
  } catch (err) {
    return handleApiError(err);
  }
}
