import { Card, CardContent } from '@/components/ui/card';
import { RankBadge } from '@/features/leaderboard/components/rank-badge';
import { formatRelativeTime, formatScore } from '@/utils/format';
import { cn } from '@/lib/utils';
import { TOP_RANKS } from '@/lib/constants';
import type { CheckpointColumn, LeaderboardRow } from '@/features/leaderboard/types';

interface LeaderboardCardsProps {
  rows: LeaderboardRow[];
  checkpoints: CheckpointColumn[];
}

export function LeaderboardCards({ rows, checkpoints }: LeaderboardCardsProps) {
  return (
    <div className="space-y-3 sm:hidden">
      {rows.map((row) => (
        <Card
          key={row.id}
          className={cn(
            row.rank === TOP_RANKS.GOLD && 'border-gold/30 bg-gold/[0.06]',
            row.rank === TOP_RANKS.SILVER && 'border-silver/30 bg-silver/[0.05]',
            row.rank === TOP_RANKS.BRONZE && 'border-bronze/30 bg-bronze/[0.05]'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <RankBadge rank={row.rank} />
                <span className="font-medium text-foreground">{row.name}</span>
              </div>
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {formatScore(row.totalScore)}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3">
              {checkpoints.map((cp, index) => (
                <div key={cp.id} className="text-center">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {cp.label.replace('Checkpoint ', 'CP')}
                  </div>
                  <div className="mt-0.5 text-sm font-medium tabular-nums text-foreground">
                    {formatScore(row.checkpointScores[index] ?? 0)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-right text-xs text-muted-foreground">
              Updated {row.lastUpdated ? formatRelativeTime(new Date(row.lastUpdated)) : '—'}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
