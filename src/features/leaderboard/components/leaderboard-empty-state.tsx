import { Trophy, SearchX } from 'lucide-react';
import { Text, Muted } from '@/components/shared/typography';

interface LeaderboardEmptyStateProps {
  variant: 'no-teams' | 'no-results';
}

export function LeaderboardEmptyState({ variant }: LeaderboardEmptyStateProps) {
  const Icon = variant === 'no-teams' ? Trophy : SearchX;
  const title = variant === 'no-teams' ? 'No teams yet' : 'No teams match your search';
  const description =
    variant === 'no-teams'
      ? "Once organizers add teams and enter checkpoint scores, they'll appear here."
      : 'Try a different team name, or clear the search to see everyone.';

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <Text className="font-medium">{title}</Text>
      <Muted className="max-w-sm">{description}</Muted>
    </div>
  );
}
