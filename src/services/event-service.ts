import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class DuplicateEventSlugError extends Error {
  constructor() {
    super('An event with this slug already exists.');
    this.name = 'DuplicateEventSlugError';
  }
}

export class EventNotFoundError extends Error {
  constructor(slug: string) {
    super(`No event found with slug "${slug}".`);
    this.name = 'EventNotFoundError';
  }
}

export async function getActiveEventBySlug(slug: string) {
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) throw new EventNotFoundError(slug);
  return event;
}

export async function getActiveEventId(slug: string): Promise<string> {
  const event = await getActiveEventBySlug(slug);
  return event.id;
}

export async function getAllEvents() {
  return prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { checkpoints: true, teams: true },
      },
    },
  });
}

export async function createEvent(data: { name: string; slug: string }) {
  try {
    return await prisma.event.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new DuplicateEventSlugError();
    }
    throw error;
  }
}

export async function updateEvent(id: string, data: { name: string; slug: string }) {
  try {
    return await prisma.event.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new DuplicateEventSlugError();
    }
    throw error;
  }
}

export async function archiveEvent(id: string) {
  return prisma.event.update({ where: { id }, data: { isActive: false } });
}

export async function activateEvent(id: string) {
  // Transaction: Deactivate currently active, then activate target
  return prisma.$transaction([
    prisma.event.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.event.update({ where: { id }, data: { isActive: true } }),
  ]);
}
