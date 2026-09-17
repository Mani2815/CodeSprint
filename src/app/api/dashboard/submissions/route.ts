import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  createWeeklySubmission,
  DuplicateSubmissionError,
  TeamSubmissionAccessError,
  SubmissionWindowError,
  getTeamSubmissions,
} from '@/services/submission-service';
import { z } from 'zod';
import { getParticipantById, hasAcceptedEthics } from '@/services/participant-service';
import { ETHICS_VERSION } from '@/lib/constants';

import { syncGithubActivity } from '@/services/github-sync-service';

const submissionSchema = z.object({
  checkpointId: z.string().min(1, 'Week is required'),
  projectTitle: z.string().min(3, 'Title is too short'),
  projectDescription: z.string().min(10, 'Description is too short'),
  problemStatement: z.string().min(10, 'Problem statement is required'),
  keyFeatures: z.string().min(10, 'Key features are required'),
  technologyStack: z.string().min(2, 'Technology stack is required'),
  aiToolsUsed: z.string().optional().or(z.literal('')),
  repositoryUrl: z.string().url('Invalid repository URL'),
  demoUrl: z.string().url('Invalid demo URL').optional().or(z.literal('')),
  demoVideoUrl: z.string().url('Invalid video URL').optional().or(z.literal('')),
  presentationUrl: z.string().url('Invalid presentation URL').optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
});

async function currentTeam() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.participantId || session.user.role === 'revoked') return null;
  const participant = await getParticipantById(session.user.participantId);
  if (!participant || !(await hasAcceptedEthics(participant.id, ETHICS_VERSION))) return null;
  return participant.team ?? null;
}

export async function GET() {
  const team = await currentTeam();
  if (!team) {
    return NextResponse.json(
      { error: 'You must be assigned to a team before submitting.' },
      { status: 403 }
    );
  }

  try {
    return NextResponse.json({ data: await getTeamSubmissions(team.id) });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {

    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId || session.user.role === 'revoked') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const participant = await getParticipantById(session.user.participantId);
    if (!participant?.teamId || !(await hasAcceptedEthics(participant.id, ETHICS_VERSION))) {
      return NextResponse.json({ error: 'You are not assigned to a team.' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const inputData = {
      ...parsed.data,
      demoUrl: parsed.data.demoUrl || null,
      demoVideoUrl: parsed.data.demoVideoUrl || null,
      presentationUrl: parsed.data.presentationUrl || null,
      additionalNotes: parsed.data.additionalNotes || null,
      aiToolsUsed: parsed.data.aiToolsUsed || null,
    };

    const submission = await createWeeklySubmission(
      session.user.participantId,
      participant.teamId,
      inputData
    );

    // Fire and forget the background analysis
    syncGithubActivity(submission.id).catch(console.error);

    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof DuplicateSubmissionError || error instanceof TeamSubmissionAccessError || error instanceof SubmissionWindowError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
