import { prisma } from '@/lib/prisma';
import type { RegistrationStatus } from '@prisma/client';

export type RegistrationInput = {
  teamName: string;
  projectName: string;
  projectDescription: string;
  college: string;
  repositoryUrl?: string | null;
  members: Array<{
    name: string;
    email: string;
    phone?: string | null;
    className: string;
    regNo?: string | null;
    githubUsername: string;
    isLeader: boolean;
  }>;
};

export class RegistrationNotFoundError extends Error {
  constructor(id: string) {
    super(`No registration found with id "${id}".`);
    this.name = 'RegistrationNotFoundError';
  }
}
export class RegistrationStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationStateError';
  }
}

export class RegistrationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationValidationError';
  }
}

export function validateRegistrationInput(input: RegistrationInput) {
  const normalizedMembers = input.members.map((member) => ({
    ...member,
    name: member.name.trim(),
    email: member.email.trim().toLowerCase(),
    phone: member.phone?.trim() || null,
    regNo: member.regNo?.trim() || null,
    githubUsername: member.githubUsername.trim().replace(/^@/, ''),
  }));

  const seen = new Set<string>();

  for (const member of normalizedMembers) {
    const identifiers: Array<[string, string]> = [
      ['GitHub username', member.githubUsername.toLowerCase()],
      ['Email', member.email.toLowerCase()],
    ];

    if (member.regNo) identifiers.push(['Registration number', member.regNo.toLowerCase()]);
    if (member.phone) identifiers.push(['Phone number', member.phone.replace(/\D/g, '')]);

    for (const [label, value] of identifiers) {
      const key = `${label}:${value}`;
      if (seen.has(key)) {
        throw new RegistrationValidationError(
          `Duplicate ${label.toLowerCase()} detected in the team registration.`
        );
      }
      seen.add(key);
    }
  }

  return {
    ...input,
    teamName: input.teamName.trim(),
    projectName: input.projectName.trim(),
    projectDescription: input.projectDescription.trim(),
    college: input.college.trim(),
    repositoryUrl: input.repositoryUrl?.trim() || null,
    members: normalizedMembers,
  };
}

export async function createRegistration(eventId: string, input: RegistrationInput) {
  const validated = validateRegistrationInput(input);

  return prisma.registration.create({
    data: {
      eventId,
      teamName: validated.teamName,
      projectName: validated.projectName,
      projectDescription: validated.projectDescription,
      college: validated.college,
      repositoryUrl: validated.repositoryUrl,
      members: {
        create: validated.members.map((member) => ({ ...member })),
      },
    },
    include: { members: true },
  });
}

export async function listRegistrations(eventId: string, status?: RegistrationStatus) {
  return prisma.registration.findMany({
    where: { eventId, ...(status ? { status } : {}) },
    include: { members: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function approveRegistration(id: string) {
  return prisma.$transaction(
    async (tx) => {
      const registration = await tx.registration.findUnique({
        where: { id },
        include: { members: true },
      });
      if (!registration) throw new RegistrationNotFoundError(id);
      if (registration.status !== 'PENDING')
        throw new RegistrationStateError('Only pending registrations can be approved.');
      const team = await tx.team.create({
        data: {
          eventId: registration.eventId,
          name: registration.teamName,
          college: registration.college,
        },
      });
      const project = await tx.project.create({
        data: {
          teamId: team.id,
          name: registration.projectName,
          description: registration.projectDescription,
          repoUrl: registration.repositoryUrl,
        },
      });
      for (const member of registration.members) {
        const githubUsername = member.githubUsername;

        // Find if they already have an account (could be a real githubId from a previous team that was deleted)
        const existingParticipant = await tx.participant.findFirst({
          where: { githubUsername: { equals: githubUsername, mode: 'insensitive' } },
        });

        if (existingParticipant) {
          await tx.participant.update({
            where: { id: existingParticipant.id },
            data: {
              name: member.name,
              teamId: team.id,
              className: member.className,
              regNo: member.regNo,
            },
          });
        } else {
          await tx.participant.create({
            data: {
              githubId: `registration:${githubUsername.toLowerCase()}`,
              githubUsername,
              name: member.name,
              teamId: team.id,
              className: member.className,
              regNo: member.regNo,
            },
          });
        }
      }
      const updated = await tx.registration.update({
        where: { id },
        data: { status: 'APPROVED', reviewedAt: new Date(), rejectionReason: null },
      });
      return { registration: updated, team, project };
    },
    {
      maxWait: 5000,
      timeout: 20000,
    }
  );
}

export async function rejectRegistration(id: string, reason: string) {
  const registration = await prisma.registration.findUnique({ where: { id } });
  if (!registration) throw new RegistrationNotFoundError(id);
  if (registration.status !== 'PENDING')
    throw new RegistrationStateError('Only pending registrations can be rejected.');
  return prisma.registration.update({
    where: { id },
    data: { status: 'REJECTED', reviewedAt: new Date(), rejectionReason: reason.trim() },
  });
}
