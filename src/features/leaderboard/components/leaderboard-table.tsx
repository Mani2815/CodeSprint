import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RankBadge } from '@/features/leaderboard/components/rank-badge';
import { formatRelativeTime, formatScore } from '@/utils/format';
import { cn } from '@/lib/utils';
import { TOP_RANKS } from '@/lib/constants';
import type { CheckpointColumn, LeaderboardRow } from '@/features/leaderboard/types';

interface LeaderboardTableProps {
  rows: LeaderboardRow[];
  checkpoints: CheckpointColumn[];
}

export function LeaderboardTable({ rows, checkpoints }: LeaderboardTableProps) {
  return (
    <div className="hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Rank</TableHead>
            <TableHead>Team</TableHead>
            {checkpoints.map((cp) => (
              <TableHead key={cp.id} className="text-right">
                {cp.label}
              </TableHead>
            ))}
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(
                row.rank === TOP_RANKS.GOLD && 'bg-gold/[0.06] hover:bg-gold/[0.09]',
                row.rank === TOP_RANKS.SILVER && 'bg-silver/[0.05] hover:bg-silver/[0.08]',
                row.rank === TOP_RANKS.BRONZE && 'bg-bronze/[0.05] hover:bg-bronze/[0.08]'
              )}
            >
              <TableCell>
                <RankBadge rank={row.rank} />
              </TableCell>
              <TableCell className="font-medium text-foreground">{row.name}</TableCell>
              {checkpoints.map((cp, index) => (
                <TableCell key={cp.id} className="text-right tabular-nums text-muted-foreground">
                  {formatScore(row.checkpointScores[index] ?? 0)}
                </TableCell>
              ))}
              <TableCell className="text-right text-base font-semibold tabular-nums text-foreground">
                {formatScore(row.totalScore)}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                {row.lastUpdated ? formatRelativeTime(new Date(row.lastUpdated)) : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
