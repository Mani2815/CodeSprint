import { Badge } from '@/components/ui/badge';
import { TOP_RANKS } from '@/lib/constants';

const MEDALS: Record<number, string> = {
  [TOP_RANKS.GOLD]: '',
  [TOP_RANKS.SILVER]: '',
  [TOP_RANKS.BRONZE]: '',
};

const VARIANTS: Record<number, 'gold' | 'silver' | 'bronze'> = {
  [TOP_RANKS.GOLD]: 'gold',
  [TOP_RANKS.SILVER]: 'silver',
  [TOP_RANKS.BRONZE]: 'bronze',
};

export function RankBadge({ rank }: { rank: number }) {
  if (rank in MEDALS) {
    return (
      <Badge variant={VARIANTS[rank]} className="gap-1 whitespace-nowrap text-sm font-semibold">
        Rank {rank}
      </Badge>
    );
  }

  return <span className="pl-2.5 text-sm font-medium text-muted-foreground">{rank}</span>;
}
