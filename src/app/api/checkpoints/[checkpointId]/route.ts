import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { updateCheckpoint, deleteCheckpoint } from '@/services/checkpoint-service';
import { updateCheckpointSchema } from '@/features/events/validations/event-schema';
import { revalidatePath } from 'next/cache';
import { logAdminAction } from '@/services/audit-service';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { checkpointId: string } }) {
  try {
    const session = await requireAdminSession();
    if (!session) return apiError(401, 'Unauthorized');

    const body = await req.json();
    const parsed = updateCheckpointSchema.parse(body);

    const oldCheckpoint = await prisma.checkpoint.findUnique({
      where: { id: params.checkpointId },
    });
    const checkpoint = await updateCheckpoint(params.checkpointId, {
      ...parsed,
      maxScore: parsed.maxScore ?? null,
    });

    await logAdminAction(
      session.user.id,
      'UPDATE_CHECKPOINT',
      'Checkpoint',
      params.checkpointId,
      oldCheckpoint,
      checkpoint
    );

    revalidatePath('/admin/events');
    return apiSuccess({ checkpoint });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { checkpointId: string } }) {
  try {
    const session = await requireAdminSession();
    if (!session) return apiError(401, 'Unauthorized');

    const oldCheckpoint = await prisma.checkpoint.findUnique({
      where: { id: params.checkpointId },
    });
    await deleteCheckpoint(params.checkpointId);

    await logAdminAction(
      session.user.id,
      'DELETE_CHECKPOINT',
      'Checkpoint',
      params.checkpointId,
      oldCheckpoint,
      null
    );

    revalidatePath('/admin/events');
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
