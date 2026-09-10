import { NextResponse } from 'next/server';
import { requireParticipantSession } from '@/lib/participant-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  className: z.string().optional(),
  regNo: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await requireParticipantSession();
    if (!session || !session.user.participantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updatedParticipant = await prisma.participant.update({
      where: { id: session.user.participantId },
      data: {
        name: parsed.data.name,
        avatarUrl: parsed.data.avatarUrl || null,
        className: parsed.data.className || null,
        regNo: parsed.data.regNo || null,
      },
    });

    return NextResponse.json({ success: true, data: updatedParticipant });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
