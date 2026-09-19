import { prisma } from '@/lib/prisma';
import { ACTIVE_EVENT_SLUG, ETHICS_VERSION } from '@/lib/constants';
import { getActiveEventId } from '@/services/event-service';
import { hasAcceptedEthics } from '@/services/participant-service';

export class DuplicateSubmissionError extends Error {
  constructor() {
    super('Your team has already submitted for this week.');
    this.name = 'DuplicateSubmissionError';
  }
}
export class TeamSubmissionAccessError extends Error {
  constructor() {
    super('You are not assigned to a team.');
    this.name = 'TeamSubmissionAccessError';
  }
}

export class SubmissionEligibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubmissionEligibilityError';
  }
}

export class SubmissionWindowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubmissionWindowError';
  }
}

export type SubmissionInput = {
  checkpointId: string;
  projectTitle: string;
  projectDescription: string;
  problemStatement: string;
  keyFeatures: string;
  technologyStack: string;
  aiToolsUsed?: string | null;
  repositoryUrl: string;
  demoUrl?: string | null;
  demoVideoUrl?: string | null;
  presentationUrl: string;
  additionalNotes?: string | null;
};
const clean = (value?: string | null) => value?.trim() || null;

export async function createWeeklySubmission(
  participantId: string,
  teamId: string,
  input: SubmissionInput
) {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    select: { teamId: true },
  });
  if (!participant || participant.teamId !== teamId) throw new TeamSubmissionAccessError();

  if (!(await hasAcceptedEthics(participantId, ETHICS_VERSION))) {
    throw new SubmissionEligibilityError(
      'You must accept the ethics agreement before submitting a project.'
    );
  }

  const activeEventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { participants: { select: { githubUsername: true } } },
  });
  if (!team) throw new TeamSubmissionAccessError();
  if (team.eventId !== activeEventId) {
    throw new SubmissionWindowError('Submissions are closed for this event.');
  }

  const checkpoint = await prisma.checkpoint.findUnique({ where: { id: input.checkpointId } });
  if (!checkpoint || checkpoint.eventId !== team.eventId) {
    throw new SubmissionWindowError('Choose a valid week for your team.');
  }
  if (!checkpoint.isActive) {
    throw new SubmissionWindowError('This submission week is not currently open.');
  }

  if (!checkpoint.submissionOpenDate || !checkpoint.submissionCloseDate) {
    throw new SubmissionWindowError('The submission schedule for this week is not configured.');
  }

  const now = Date.now();
  if (now < checkpoint.submissionOpenDate.getTime()) {
    throw new SubmissionWindowError('The submission window for this week has not opened yet.');
  }
  if (now > checkpoint.submissionCloseDate.getTime()) {
    throw new SubmissionWindowError('The submission deadline for this week has passed.');
  }

  const existing = await prisma.weeklySubmission.findUnique({
    where: { teamId_checkpointId: { teamId, checkpointId: input.checkpointId } },
  });
  if (existing && !existing.isDraft) throw new DuplicateSubmissionError();

  if (existing && existing.isDraft) {
    return prisma.weeklySubmission.update({
      where: { id: existing.id },
      data: {
        projectTitle: input.projectTitle.trim(),
        projectDescription: input.projectDescription.trim(),
        problemStatement: input.problemStatement.trim(),
        keyFeatures: input.keyFeatures.trim(),
        technologyStack: input.technologyStack.trim(),
        aiToolsUsed: clean(input.aiToolsUsed),
        repositoryUrl: input.repositoryUrl.trim(),
        demoUrl: clean(input.demoUrl),
        demoVideoUrl: clean(input.demoVideoUrl),
        presentationUrl: clean(input.presentationUrl),
        additionalNotes: clean(input.additionalNotes),
        isDraft: false,
        submittedAt: new Date(),
      },
    });
  }

  return prisma.weeklySubmission.create({
    data: {
      teamId,
      checkpointId: input.checkpointId,
      projectTitle: input.projectTitle.trim(),
      projectDescription: input.projectDescription.trim(),
      problemStatement: input.problemStatement.trim(),
      keyFeatures: input.keyFeatures.trim(),
      technologyStack: input.technologyStack.trim(),
      aiToolsUsed: clean(input.aiToolsUsed),
      repositoryUrl: input.repositoryUrl.trim(),
      demoUrl: clean(input.demoUrl),
      demoVideoUrl: clean(input.demoVideoUrl),
      presentationUrl: clean(input.presentationUrl),
      additionalNotes: clean(input.additionalNotes),
      verificationStatus: 'QUEUED',
    },
  });
}

export async function getTeamSubmissions(teamId: string) {
  return prisma.weeklySubmission.findMany({
    where: { teamId, isDraft: false },
    include: { checkpoint: true, analytics: true },
    orderBy: { checkpoint: { order: 'desc' } },
  });
}
export async function listSubmissions(eventId: string) {
  return prisma.weeklySubmission.findMany({
    where: { team: { eventId }, isDraft: false },
    include: { team: true, checkpoint: true, analytics: true },
    orderBy: [{ checkpoint: { order: 'desc' } }, { submittedAt: 'desc' }],
  });
}
export async function getSubmissionDetail(id: string) {
  return prisma.weeklySubmission.findUnique({
    where: { id },
    include: {
      checkpoint: true,
      analytics: true,
      team: { include: { participants: true, evaluations: true } },
    },
  });
}
