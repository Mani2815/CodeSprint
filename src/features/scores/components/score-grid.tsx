import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Text, Muted } from '@/components/shared/typography';
import { ListOrdered } from 'lucide-react';
import { ScoreRow } from '@/features/scores/components/score-row';
import type { CheckpointColumn } from '@/features/leaderboard/types';
import type { TeamScoreRow } from '@/features/scores/types';

interface ScoreGridProps {
  checkpoints: CheckpointColumn[];
  teams: TeamScoreRow[];
}

export function ScoreGrid({ checkpoints, teams }: ScoreGridProps) {
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
          <ListOrdered className="size-6" />
        </div>
        <Text className="font-medium">No teams to score yet</Text>
        <Muted className="max-w-sm">Add teams on the Teams page before entering scores.</Muted>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Team</TableHead>
          {checkpoints.map((cp) => (
            <TableHead key={cp.id} className="text-right">
              {cp.label}
            </TableHead>
          ))}
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Last Updated</TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <ScoreRow
            key={team.teamId}
            teamId={team.teamId}
            teamName={team.teamName}
            checkpoints={checkpoints}
            initialScores={Object.fromEntries(team.scores.map((s) => [s.checkpointId, s.value]))}
            lastUpdated={team.lastUpdated}
          />
        ))}
      </TableBody>
    </Table>
  );
}
