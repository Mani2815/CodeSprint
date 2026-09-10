import { prisma } from '@/lib/prisma';

export class EvaluationScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvaluationScopeError';
  }
}

export type EvaluationInput = {
  teamId: string;
  checkpointId: string;
  innovation: number;
  technical: number;
  ui: number;
  documentation: number;
  githubScore: number;
  comments?: string | null;
};

export function evaluationTotal(
  input: Omit<EvaluationInput, 'teamId' | 'checkpointId' | 'comments'>
) {
  return (
    input.innovation +
    input.technical +
    input.ui +
    input.documentation +
    input.githubScore
  );
}

/** Saves rubric detail and its leaderboard total atomically. */
export async function saveEvaluation(input: EvaluationInput) {
  const total = evaluationTotal(input);
  return prisma.$transaction(async (tx) => {
    const [team, checkpoint] = await Promise.all([
      tx.team.findUnique({ where: { id: input.teamId }, select: { eventId: true } }),
      tx.checkpoint.findUnique({ where: { id: input.checkpointId }, select: { eventId: true } }),
    ]);

    if (!team || !checkpoint) {
      throw new EvaluationScopeError('Choose a valid team and checkpoint.');
    }

    if (team.eventId !== checkpoint.eventId) {
      throw new EvaluationScopeError('The team and checkpoint must belong to the same event.');
    }

    const evaluation = await tx.evaluation.upsert({
      where: { teamId_checkpointId: { teamId: input.teamId, checkpointId: input.checkpointId } },
      create: { ...input, comments: input.comments?.trim() || null, total },
      update: { ...input, comments: input.comments?.trim() || null, total },
    });
    await tx.score.upsert({
      where: { teamId_checkpointId: { teamId: input.teamId, checkpointId: input.checkpointId } },
      create: { teamId: input.teamId, checkpointId: input.checkpointId, value: total },
      update: { value: total },
    });
    return evaluation;
  });
}

export async function listEvaluations(eventId: string) {
  return prisma.evaluation.findMany({
    where: { team: { eventId } },
    include: { team: { select: { id: true, name: true } }, checkpoint: true },
    orderBy: [{ checkpoint: { order: 'asc' } }, { team: { name: 'asc' } }],
  });
}
