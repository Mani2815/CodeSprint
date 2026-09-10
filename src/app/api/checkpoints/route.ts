import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { apiError, apiSuccess, handleApiError } from '@/lib/api-response';
import { createCheckpoint } from '@/services/checkpoint-service';
import { checkpointSchema } from '@/features/events/validations/event-schema';
import { revalidatePath } from 'next/cache';
import { logAdminAction } from '@/services/audit-service';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) return apiError(401, 'Unauthorized');

    const body = await req.json();
    const parsed = checkpointSchema.parse(body);

    const checkpoint = await createCheckpoint({
      ...parsed,
      maxScore: parsed.maxScore ?? null,
    });
    await logAdminAction(
      session.user.id,
      'CREATE_CHECKPOINT',
      'Checkpoint',
      checkpoint.id,
      null,
      checkpoint
    );
    revalidatePath('/admin/events');
    return apiSuccess({ checkpoint }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
