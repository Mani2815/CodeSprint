/**
 * Domain types for ranking. Kept separate from Prisma's generated types so
 * the pure ranking algorithm in `utils/ranking.ts` never depends on the
 * database client — it can be unit tested with plain objects.
 */

export interface TeamScoreEntry {
  /** The checkpoint's `order` (1-4 today, but not assumed fixed elsewhere). */
  checkpointOrder: number;
  value: number;
  updatedAt: Date;
}

export interface TeamWithScores {
  id: string;
  name: string;
  createdAt: Date;
  scores: TeamScoreEntry[];
}

export interface RankedTeam {
  rank: number;
  id: string;
  name: string;
  totalScore: number;
  /** Keyed by checkpoint order, e.g. { 1: 40, 2: 55, 3: 0, 4: 0 } */
  scoresByCheckpoint: Record<number, number>;
  /** Most recent score update for this team, or null if never scored. */
  lastUpdated: Date | null;
  createdAt: Date;
}
