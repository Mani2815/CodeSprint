export interface TeamScoreRow {
  teamId: string;
  teamName: string;
  scores: Array<{ checkpointId: string; value: number }>;
  /** ISO string, not Date - crosses the server/client boundary. */
  lastUpdated: string | null;
}
