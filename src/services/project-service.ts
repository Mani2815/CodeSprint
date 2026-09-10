import { prisma } from '@/lib/prisma';

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`No project found with id "${id}".`);
    this.name = 'ProjectNotFoundError';
  }
}

export type ProjectInput = {
  teamId: string;
  name: string;
  description?: string | null;
  repoUrl?: string | null;
  category?: string | null;
};

function clean(value?: string | null) {
  return value?.trim() || null;
}

export async function listProjects(eventId: string) {
  return prisma.project.findMany({
    where: { team: { eventId } },
    include: { team: { select: { id: true, name: true, college: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createProject(input: ProjectInput) {
  return prisma.project.create({
    data: {
      ...input,
      name: input.name.trim(),
      description: clean(input.description),
      repoUrl: clean(input.repoUrl),
      category: clean(input.category),
    },
  });
}

export async function updateProject(id: string, input: Omit<ProjectInput, 'teamId'>) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new ProjectNotFoundError(id);
  return prisma.project.update({
    where: { id },
    data: {
      name: input.name.trim(),
      description: clean(input.description),
      repoUrl: clean(input.repoUrl),
      category: clean(input.category),
    },
  });
}

export async function deleteProject(id: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new ProjectNotFoundError(id);
  return prisma.project.delete({ where: { id } });
}
