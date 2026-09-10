import { Trophy, Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { getDashboardStats } from '@/services/dashboard-service';
import { EventNotFoundError } from '@/services/event-service';
import { StatCard } from '@/features/dashboard/components/stat-card';
import { Card, CardContent } from '@/components/ui/card';
import { Muted, Text } from '@/components/shared/typography';
import { formatRelativeTime, formatScore } from '@/utils/format';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';

export async function DashboardStats() {
  let stats;
  try {
    stats = await getDashboardStats(ACTIVE_EVENT_SLUG);
  } catch (err) {
    if (err instanceof EventNotFoundError) {
      return (
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <Text className="font-medium">Event not set up yet</Text>
              <Muted>
                Run <code className="rounded bg-surface px-1.5 py-0.5">npm run db:seed</code> to
                create the CodeSprint event and checkpoints.
              </Muted>
            </div>
          </CardContent>
        </Card>
      );
    }
    throw err;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Teams" value={String(stats.totalTeams)} icon={Users} />
      <StatCard
        label="Current Leader"
        value={stats.currentLeaderName ?? '—'}
        hint={stats.totalTeams === 0 ? 'No teams yet' : undefined}
        icon={Trophy}
      />
      <StatCard
        label="Average Score"
        value={stats.totalTeams === 0 ? '—' : formatScore(stats.averageScore)}
        icon={TrendingUp}
      />
      <StatCard
        label="Last Updated"
        value={stats.lastUpdated ? formatRelativeTime(stats.lastUpdated) : 'No scores yet'}
        icon={Clock}
      />
    </div>
  );
}
