import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { activateEvent } from '@/services/event-service';
import { revalidatePath } from 'next/cache';
import { logAdminAction } from '@/services/audit-service';

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const session = await requireAdminSession();
    if (!session) return apiError(401, 'Unauthorized');

    await activateEvent(params.eventId);
    await logAdminAction(session.user.id, 'ACTIVATE_EVENT', 'Event', params.eventId);

    revalidatePath('/');
    revalidatePath('/admin', 'layout');

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
