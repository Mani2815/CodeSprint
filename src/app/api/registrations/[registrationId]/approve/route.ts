import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { approveRegistration } from '@/services/registration-service';
export async function PATCH(_req: Request, { params }: { params: { registrationId: string } }) {
  if (!(await requireAdminSession())) return apiError(401, 'Unauthorized.');
  try {
    return apiSuccess(await approveRegistration(params.registrationId));
  } catch (err) {
    return handleApiError(err);
  }
}
