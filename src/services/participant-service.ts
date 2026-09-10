import { prisma } from '@/lib/prisma';

export interface GithubIdentity {
  githubId: string;
  githubUsername: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export async function validateParticipantAccess(participantId: string): Promise<boolean> {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: { team: { include: { event: true } } },
  });

  if (!participant || !participant.team || !participant.team.event) {
    return false;
  }

  // Registration must still be APPROVED
  const registration = await prisma.registration.findFirst({
    where: {
      eventId: participant.team.eventId,
      teamName: participant.team.name,
      status: 'APPROVED',
    },
  });

  return Boolean(registration);
}

export async function isParticipantAllowed(githubId: string, githubUsername: string) {
  let participant = await prisma.participant.findUnique({ where: { githubId } });

  if (!participant) {
    participant = await prisma.participant.findFirst({
      where: {
        githubUsername: { equals: githubUsername, mode: 'insensitive' },
        githubId: { startsWith: 'registration:' },
      },
    });
  }

  if (!participant) return false;

  return validateParticipantAccess(participant.id);
}

export async function upsertParticipant(identity: GithubIdentity) {
  // 1. Check if participant already successfully logged in before (match by true githubId)
  const existingById = await prisma.participant.findUnique({
    where: { githubId: identity.githubId },
  });

  if (existingById) {
    return prisma.participant.update({
      where: { id: existingById.id },
      data: {
        githubUsername: identity.githubUsername,
        name: identity.name ?? existingById.name,
        avatarUrl: identity.avatarUrl ?? existingById.avatarUrl,
      },
    });
  }

  // 2. Match against pre-created roster entry from Registration Approval (by githubUsername)
  const registered = await prisma.participant.findFirst({
    where: { githubUsername: { equals: identity.githubUsername, mode: 'insensitive' } },
  });

  if (registered) {
    if (registered.githubId && !registered.githubId.startsWith('registration:')) {
      throw new Error(
        'AccessDenied: This participant profile is already linked to a different GitHub account.'
      );
    }

    return prisma.participant.update({
      where: { id: registered.id },
      data: {
        githubId: identity.githubId, // Link their actual GitHub ID
        githubUsername: identity.githubUsername,
        name: identity.name ?? registered.name,
        avatarUrl: identity.avatarUrl ?? null,
      },
    });
  }

  // 3. Fallback (should be blocked by signIn callback, but for safety)
  throw new Error('AccessDenied: GitHub account is not linked to an approved registration.');
}

export async function getParticipantById(id: string) {
  return prisma.participant.findUnique({
    where: { id },
    include: {
      team: true,
      githubActivities: {
        include: { sprintWeek: true },
        orderBy: { syncedAt: 'desc' },
      },
      tokenLedger: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

export async function hasAcceptedEthics(participantId: string, version: string) {
  const acceptance = await prisma.ethicsAcceptance.findUnique({
    where: { participantId_version: { participantId, version } },
    select: { id: true },
  });
  return Boolean(acceptance);
}

export async function acceptEthics(participantId: string, version: string) {
  return prisma.ethicsAcceptance.upsert({
    where: { participantId_version: { participantId, version } },
    create: { participantId, version },
    update: { acceptedAt: new Date() },
  });
}
