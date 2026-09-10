import { getActiveEventId } from '@/services/event-service';
import { getTeamsWithScores } from '@/services/leaderboard-service';
import { rankTeams } from '@/utils/ranking';

export interface DashboardStats {
  totalTeams: number;
  lastUpdated: Date | null;
  currentLeaderName: string | null;
  averageScore: number;
}

export async function getDashboardStats(eventSlug: string): Promise<DashboardStats> {
  const eventId = await getActiveEventId(eventSlug);
  const teams = await getTeamsWithScores(eventId);
  const ranked = rankTeams(teams);

  const totalTeams = ranked.length;
  const currentLeaderName = ranked[0]?.name ?? null;

  const averageScore =
    totalTeams === 0 ? 0 : ranked.reduce((sum, t) => sum + t.totalScore, 0) / totalTeams;

  const lastUpdated = ranked.reduce<Date | null>((latest, t) => {
    if (!t.lastUpdated) return latest;
    if (!latest || t.lastUpdated > latest) return t.lastUpdated;
    return latest;
  }, null);

  return {
    totalTeams,
    lastUpdated,
    currentLeaderName,
    averageScore: Math.round(averageScore * 100) / 100,
  };
}
