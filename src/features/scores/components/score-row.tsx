'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { ScoreInput } from '@/features/scores/components/score-input';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime, formatScore } from '@/utils/format';
import { SCORE_LIMITS } from '@/lib/constants';
import type { CheckpointColumn } from '@/features/leaderboard/types';

interface ScoreRowProps {
  teamId: string;
  teamName: string;
  checkpoints: CheckpointColumn[];
  initialScores: Record<string, number>;
  lastUpdated: string | null;
}

export function ScoreRow({
  teamId,
  teamName,
  checkpoints,
  initialScores,
  lastUpdated,
}: ScoreRowProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(checkpoints.map((cp) => [cp.id, String(initialScores[cp.id] ?? 0)]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [savedLastUpdated, setSavedLastUpdated] = useState(lastUpdated);
  const [isDirty, setIsDirty] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Total is always derived from the current inputs, live, and is never
  // itself an editable field — exactly per the brief.
  const total = checkpoints.reduce((sum, cp) => sum + (Number(values[cp.id]) || 0), 0);

  function handleChange(checkpointId: string, raw: string) {
    setValues((prev) => ({ ...prev, [checkpointId]: raw }));
    setIsDirty(true);
  }

  async function handleSave() {
    const scores: Array<{ checkpointId: string; value: number }> = [];
    for (const cp of checkpoints) {
      const num = Number(values[cp.id]);
      if (!Number.isInteger(num) || num < SCORE_LIMITS.MIN || num > SCORE_LIMITS.MAX) {
        toast({
          title: 'Invalid score',
          description: `Scores must be whole numbers between ${SCORE_LIMITS.MIN} and ${SCORE_LIMITS.MAX}.`,
          variant: 'destructive',
        });
        return;
      }
      scores.push({ checkpointId: cp.id, value: num });
    }

    setIsSaving(true);
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId, scores }),
    });
    const json = await res.json().catch(() => ({}));
    setIsSaving(false);

    if (!res.ok) {
      toast({
        title: 'Could not save scores',
        description: json.error ?? 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    const updatedTeam = json.data?.team as
      { totalScore: number; rank: number; lastUpdated: string | null } | undefined;

    toast({
      title: 'Scores saved',
      description: updatedTeam
        ? `${teamName} — total ${formatScore(updatedTeam.totalScore)}, now rank #${updatedTeam.rank}.`
        : `${teamName}'s scores were saved.`,
    });

    setSavedLastUpdated(updatedTeam?.lastUpdated ?? new Date().toISOString());
    setIsDirty(false);
    router.refresh();
  }

  return (
    <TableRow>
      <TableCell className="font-medium text-foreground">{teamName}</TableCell>
      {checkpoints.map((cp) => (
        <TableCell key={cp.id}>
          <ScoreInput
            label={`${teamName} — ${cp.label}`}
            value={values[cp.id] ?? '0'}
            onChange={(v) => handleChange(cp.id, v)}
            disabled={isSaving}
          />
        </TableCell>
      ))}
      <TableCell className="text-right text-base font-semibold tabular-nums text-foreground">
        {formatScore(total)}
      </TableCell>
      <TableCell className="text-right text-xs text-muted-foreground">
        {savedLastUpdated ? formatRelativeTime(new Date(savedLastUpdated)) : '—'}
      </TableCell>
      <TableCell>
        <Button size="sm" onClick={handleSave} disabled={isSaving || !isDirty}>
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </TableCell>
    </TableRow>
  );
}
