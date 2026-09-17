import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { z } from 'zod';

const scheduleSchema = z.object({
  timezone: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  checkpoints: z.array(z.object({
    id: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    submissionOpenDate: z.string().nullable(),
    submissionCloseDate: z.string().nullable(),
  })),
});

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        checkpoints: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ data: event });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
    const body = await req.json();
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { timezone, startDate, endDate, checkpoints } = parsed.data;

    await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: {
          timezone,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        },
      });

      for (const cp of checkpoints) {
        await tx.checkpoint.update({
          where: { id: cp.id },
          data: {
            startDate: cp.startDate ? new Date(cp.startDate) : null,
            endDate: cp.endDate ? new Date(cp.endDate) : null,
            submissionOpenDate: cp.submissionOpenDate ? new Date(cp.submissionOpenDate) : null,
            submissionCloseDate: cp.submissionCloseDate ? new Date(cp.submissionCloseDate) : null,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
