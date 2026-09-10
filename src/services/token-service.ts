import type { TokenReason } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function getParticipantTokenBalance(participantId: string) {
  const result = await prisma.tokenLedger.aggregate({
    where: { participantId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function addTokenLedgerEntry(input: {
  participantId: string;
  amount: number;
  reason: TokenReason;
  approvedById?: string;
}) {
  return prisma.tokenLedger.create({
    data: {
      participantId: input.participantId,
      amount: input.amount,
      reason: input.reason,
      approvedById: input.approvedById,
    },
  });
}
