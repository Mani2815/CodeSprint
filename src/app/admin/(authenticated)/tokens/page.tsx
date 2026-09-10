import { revalidatePath } from 'next/cache';
import { TokenReason } from '@prisma/client';
import { addTokenLedgerEntry } from '@/services/token-service';
import { prisma } from '@/lib/prisma';
import { ROUTES } from '@/lib/constants';
import { requireAdminPageSession } from '@/lib/auth-guards';

async function approveToken(formData: FormData) {
  'use server';
  const session = await requireAdminPageSession();

  const participantId = String(formData.get('participantId') ?? '');
  const amount = Number(formData.get('amount'));
  const reason = String(formData.get('reason') ?? '');
  if (!participantId || !Number.isInteger(amount) || amount <= 0) return;
  if (reason !== TokenReason.HOD_APPROVED && reason !== TokenReason.MANUAL) return;

  await addTokenLedgerEntry({
    participantId,
    amount,
    reason,
    approvedById: session.user.id,
  });
  revalidatePath('/admin/tokens');
  revalidatePath(ROUTES.DASHBOARD);
}

export default async function AdminTokensPage() {
  const participants = await prisma.participant.findMany({
    orderBy: { githubUsername: 'asc' },
    select: { id: true, githubUsername: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Token approvals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add an auditable token credit for a participant.
        </p>
      </div>
      <form action={approveToken} className="grid max-w-xl gap-4 rounded-lg border p-5">
        <label className="grid gap-2 text-sm">
          Participant
          <select
            className="rounded-md border bg-background px-3 py-2"
            name="participantId"
            required
          >
            <option value="">Select participant</option>
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name ?? participant.githubUsername} (@{participant.githubUsername})
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Tokens
          <input
            className="rounded-md border bg-background px-3 py-2"
            min="1"
            name="amount"
            required
            type="number"
          />
        </label>
        <label className="grid gap-2 text-sm">
          Reason
          <select
            className="rounded-md border bg-background px-3 py-2"
            defaultValue={TokenReason.HOD_APPROVED}
            name="reason"
          >
            <option value={TokenReason.HOD_APPROVED}>HoD approved</option>
            <option value={TokenReason.MANUAL}>Manual</option>
          </select>
        </label>
        <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" type="submit">
          Approve tokens
        </button>
      </form>
    </div>
  );
}
