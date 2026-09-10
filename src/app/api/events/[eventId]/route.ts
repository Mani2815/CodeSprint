import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { updateEvent, archiveEvent } from '@/services/event-service';
import { eventSchema } from '@/features/events/validations/event-schema';
import { revalidatePath } from 'next/cache';
import { logAdminAction } from '@/services/audit-service';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const session = await requireAdminSession();
    if (!session) return apiError(401, 'Unauthorized');

    const body = await req.json();
    const parsed = eventSchema.parse(body);

    const oldEvent = await prisma.event.findUnique({ where: { id: params.eventId } });
    const event = await updateEvent(params.eventId, parsed);

    await logAdminAction(session.user.id, 'UPDATE_EVENT', 'Event', params.eventId, oldEvent, event);

    revalidatePath('/admin/events');
    return apiSuccess({ event });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const session = await requireAdminSession();
    if (!session) return apiError(401, 'Unauthorized');

    const oldEvent = await prisma.event.findUnique({ where: { id: params.eventId } });
    await archiveEvent(params.eventId);

    await logAdminAction(session.user.id, 'DELETE_EVENT', 'Event', params.eventId, oldEvent, null);

    revalidatePath('/admin/events');
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
