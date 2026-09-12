import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getParticipantById, hasAcceptedEthics } from '@/services/participant-service';
import { ETHICS_VERSION } from '@/lib/constants';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { syncGithubActivity } from '@/services/github-sync-service';

const connectSchema = z.object({
  repositoryUrl: z.string().url('Invalid repository URL'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId || session.user.role === 'revoked') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const participant = await getParticipantById(session.user.participantId);
    if (!participant?.teamId || !(await hasAcceptedEthics(participant.id, ETHICS_VERSION))) {
      return NextResponse.json({ error: 'You are not assigned to a team or have not accepted ethics.' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = connectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
    
    // Find the currently active checkpoint
    const activeCheckpoint = await prisma.checkpoint.findFirst({
      where: { eventId, isActive: true },
      orderBy: { order: 'asc' },
    });

    if (!activeCheckpoint) {
      return NextResponse.json({ error: 'No active sprint week is open.' }, { status: 400 });
    }

    // Check if they already submitted
    const existing = await prisma.weeklySubmission.findUnique({
      where: { teamId_checkpointId: { teamId: participant.teamId, checkpointId: activeCheckpoint.id } },
    });

    let submissionId = '';

    if (existing) {
      if (!existing.isDraft) {
        return NextResponse.json({ error: 'You have already submitted for this week.' }, { status: 400 });
      }
      
      // Update the draft's repoUrl
      const updated = await prisma.weeklySubmission.update({
        where: { id: existing.id },
        data: { repositoryUrl: parsed.data.repositoryUrl.trim() },
      });
      submissionId = updated.id;
    } else {
      // Create a draft submission to hold the repo URL
      const draft = await prisma.weeklySubmission.create({
        data: {
          teamId: participant.teamId,
          checkpointId: activeCheckpoint.id,
          projectTitle: 'To be submitted',
          projectDescription: 'Pending',
          problemStatement: 'Pending',
          keyFeatures: 'Pending',
          technologyStack: 'Pending',
          repositoryUrl: parsed.data.repositoryUrl.trim(),
          isDraft: true,
          verificationStatus: 'QUEUED',
        },
      });
      submissionId = draft.id;
    }

    // Immediately trigger a sync for analytics
    await syncGithubActivity(submissionId);

    return NextResponse.json({ success: true, submissionId }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId || session.user.role === 'revoked') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const participant = await getParticipantById(session.user.participantId);
    if (!participant?.teamId) {
      return NextResponse.json({ error: 'You are not assigned to a team.' }, { status: 403 });
    }

    const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
    
    // Find the currently active checkpoint
    const activeCheckpoint = await prisma.checkpoint.findFirst({
      where: { eventId, isActive: true },
      orderBy: { order: 'asc' },
    });

    if (!activeCheckpoint) {
      return NextResponse.json({ error: 'No active sprint week is open.' }, { status: 400 });
    }

    const existing = await prisma.weeklySubmission.findUnique({
      where: { teamId_checkpointId: { teamId: participant.teamId, checkpointId: activeCheckpoint.id } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'No repository is currently connected.' }, { status: 404 });
    }

    if (!existing.isDraft) {
      return NextResponse.json({ error: 'Cannot remove a finalized submission.' }, { status: 400 });
    }

    await prisma.weeklySubmission.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
