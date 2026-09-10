'use client';

import { LeaderboardSearch } from '@/features/leaderboard/components/leaderboard-search';
import { LeaderboardTable } from '@/features/leaderboard/components/leaderboard-table';
import { LeaderboardCards } from '@/features/leaderboard/components/leaderboard-cards';
import { LeaderboardPagination } from '@/features/leaderboard/components/leaderboard-pagination';
import { LeaderboardEmptyState } from '@/features/leaderboard/components/leaderboard-empty-state';
import { useLeaderboardFilter } from '@/features/leaderboard/hooks/use-leaderboard-filter';
import { Muted } from '@/components/shared/typography';
import type { CheckpointColumn, LeaderboardRow } from '@/features/leaderboard/types';

interface LeaderboardViewProps {
  rows: LeaderboardRow[];
  checkpoints: CheckpointColumn[];
}

export function LeaderboardView({ rows, checkpoints }: LeaderboardViewProps) {
  const { search, setSearch, page, setPage, totalPages, showPagination, filteredCount, pagedRows } =
    useLeaderboardFilter(rows);

  if (rows.length === 0) {
    return <LeaderboardEmptyState variant="no-teams" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LeaderboardSearch value={search} onChange={setSearch} />
        <Muted>
          {filteredCount} {filteredCount === 1 ? 'team' : 'teams'}
        </Muted>
      </div>

      {pagedRows.length === 0 ? (
        <LeaderboardEmptyState variant="no-results" />
      ) : (
        <>
          <LeaderboardTable rows={pagedRows} checkpoints={checkpoints} />
          <LeaderboardCards rows={pagedRows} checkpoints={checkpoints} />
        </>
      )}

      {showPagination && (
        <LeaderboardPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
