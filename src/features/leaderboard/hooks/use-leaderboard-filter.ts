'use client';

import { useMemo, useState } from 'react';
import { matchesSearch } from '@/utils/search';
import { LEADERBOARD_PAGE_SIZE } from '@/lib/constants';
import type { LeaderboardRow } from '@/features/leaderboard/types';

export function useLeaderboardFilter(rows: LeaderboardRow[]) {
  const [search, setSearchState] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => rows.filter((row) => matchesSearch(row.name, search)),
    [rows, search]
  );

  const showPagination = filtered.length > LEADERBOARD_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filtered.length / LEADERBOARD_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pagedRows = showPagination
    ? filtered.slice((safePage - 1) * LEADERBOARD_PAGE_SIZE, safePage * LEADERBOARD_PAGE_SIZE)
    : filtered;

  function setSearch(value: string) {
    setSearchState(value);
    setPage(1); // a new search always starts back on page 1
  }

  return {
    search,
    setSearch,
    page: safePage,
    setPage,
    totalPages,
    showPagination,
    filteredCount: filtered.length,
    pagedRows,
  };
}
