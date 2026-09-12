import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncGithubActivity } from '@/services/github-sync-service';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId || session.user.role === 'revoked') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id: session.user.participantId },
      include: {
        team: {
          include: {
            submissions: {
              orderBy: { checkpoint: { order: 'desc' } },
              take: 1,
            },
          },
        },
      },
    });

    if (!participant?.teamId) {
      return NextResponse.json({ error: 'You are not assigned to a team.' }, { status: 403 });
    }

    const latestSubmission = participant.team?.submissions[0];
    if (!latestSubmission) {
      return NextResponse.json({ error: 'No repository connected yet.' }, { status: 404 });
    }

    // Trigger sync for this specific submission
    await syncGithubActivity(latestSubmission.id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
