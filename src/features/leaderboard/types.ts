export interface LeaderboardRow {
  rank: number;
  id: string;
  name: string;
  totalScore: number;
  /** Aligned by index with the checkpoints array passed alongside this row. */
  checkpointScores: number[];
  /** ISO string, not Date — this crosses the server/client component boundary. */
  lastUpdated: string | null;
}

export interface CheckpointColumn {
  id: string;
  label: string;
  order: number;
}
