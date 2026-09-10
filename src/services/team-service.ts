import { prisma } from '@/lib/prisma';

export class DuplicateTeamNameError extends Error {
  constructor(name: string) {
    super(`A team named "${name}" already exists for this event.`);
    this.name = 'DuplicateTeamNameError';
  }
}

export class TeamNotFoundError extends Error {
  constructor(id: string) {
    super(`No team found with id "${id}".`);
    this.name = 'TeamNotFoundError';
  }
}

async function assertNameAvailable(eventId: string, name: string, excludeTeamId?: string) {
  const existing = await prisma.team.findFirst({
    where: {
      eventId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeTeamId ? { id: { not: excludeTeamId } } : {}),
    },
    select: { id: true },
  });
  if (existing) throw new DuplicateTeamNameError(name);
}

export async function listTeams(eventId: string) {
  return prisma.team.findMany({
    where: { eventId },
    include: { project: true, participants: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getTeamPublicProfile(teamId: string) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      project: true,
      participants: {
        include: {
          githubActivities: { include: { sprintWeek: true }, orderBy: { syncedAt: 'desc' } },
        },
      },
      scores: { include: { checkpoint: true }, orderBy: { checkpoint: { order: 'asc' } } },
    },
  });
}

export async function createTeam(eventId: string, name: string) {
  const trimmed = name.trim();
  await assertNameAvailable(eventId, trimmed);
  return prisma.team.create({ data: { eventId, name: trimmed } });
}

export async function updateTeamName(teamId: string, name: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new TeamNotFoundError(teamId);

  const trimmed = name.trim();
  await assertNameAvailable(team.eventId, trimmed, teamId);

  return prisma.team.update({ where: { id: teamId }, data: { name: trimmed } });
}

/** Deleting a team cascades to its Score rows (see schema.prisma onDelete: Cascade). */
export async function deleteTeam(teamId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw new TeamNotFoundError(teamId);

  await prisma.team.delete({ where: { id: teamId } });
}
