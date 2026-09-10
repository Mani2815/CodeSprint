import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { createEvent, getAllEvents } from '@/services/event-service';
import { eventSchema } from '@/features/events/validations/event-schema';
import { revalidatePath } from 'next/cache';
import { logAdminAction } from '@/services/audit-service';

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session) return apiError(401, 'Unauthorized');

    const events = await getAllEvents();
    return apiSuccess({ events });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) return apiError(401, 'Unauthorized');

    const body = await req.json();
    const parsed = eventSchema.parse(body);

    const event = await createEvent(parsed);
    await logAdminAction(session.user.id, 'CREATE_EVENT', 'Event', event.id, null, event);
    revalidatePath('/admin/events');
    return apiSuccess({ event }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
