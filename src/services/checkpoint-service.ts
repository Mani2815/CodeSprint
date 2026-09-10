import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class CheckpointHasDataError extends Error {
  constructor() {
    super('Cannot delete a checkpoint that has scores or GitHub activity attached.');
    this.name = 'CheckpointHasDataError';
  }
}

export class DuplicateCheckpointOrderError extends Error {
  constructor() {
    super('A checkpoint with this order already exists for this event.');
    this.name = 'DuplicateCheckpointOrderError';
  }
}

export async function getCheckpointsForEvent(eventId: string) {
  return prisma.checkpoint.findMany({
    where: { eventId },
    orderBy: { order: 'asc' },
  });
}

export async function createCheckpoint(data: {
  eventId: string;
  label: string;
  order: number;
  maxScore: number | null;
}) {
  try {
    return await prisma.checkpoint.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new DuplicateCheckpointOrderError();
    }
    throw error;
  }
}

export async function updateCheckpoint(
  id: string,
  data: { label: string; order: number; maxScore: number | null }
) {
  try {
    return await prisma.checkpoint.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new DuplicateCheckpointOrderError();
    }
    throw error;
  }
}

export async function deleteCheckpoint(id: string) {
  const cp = await prisma.checkpoint.findUnique({
    where: { id },
    include: {
      _count: {
        select: { scores: true, githubActivities: true },
      },
    },
  });

  if (cp && (cp._count.scores > 0 || cp._count.githubActivities > 0)) {
    throw new CheckpointHasDataError();
  }

  return prisma.checkpoint.delete({ where: { id } });
}
