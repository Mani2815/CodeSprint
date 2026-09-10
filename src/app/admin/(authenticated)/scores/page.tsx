import { H1, Muted } from '@/components/shared/typography';
import { ScoreGrid } from '@/features/scores/components/score-grid';
import { listTeamsWithScores } from '@/services/score-service';
import { getCheckpointsForEvent } from '@/services/checkpoint-service';
import { getActiveEventId, EventNotFoundError } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import type { CheckpointColumn } from '@/features/leaderboard/types';
import type { TeamScoreRow } from '@/features/scores/types';

export const metadata = {
  title: 'Scores',
};

export const dynamic = 'force-dynamic';

export default async function AdminScoresPage() {
  let checkpoints: CheckpointColumn[] = [];
  let teams: TeamScoreRow[] = [];
  let eventNotSeeded = false;

  try {
    const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
    const [checkpointRows, teamRows] = await Promise.all([
      getCheckpointsForEvent(eventId),
      listTeamsWithScores(eventId),
    ]);

    checkpoints = checkpointRows.map((c) => ({ id: c.id, label: c.label, order: c.order }));
    teams = teamRows.map((t) => ({
      teamId: t.teamId,
      teamName: t.teamName,
      scores: t.scores,
      lastUpdated: t.lastUpdated ? t.lastUpdated.toISOString() : null,
    }));
  } catch (err) {
    if (err instanceof EventNotFoundError) {
      eventNotSeeded = true;
    } else {
      throw err;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <H1 className="text-3xl sm:text-4xl">Scores</H1>
        <Muted className="mt-1">
          Enter checkpoint scores per team. Totals and rankings update automatically on save.
        </Muted>
      </div>

      {eventNotSeeded ? (
        <Muted>Run `npm run db:seed` to set up the event before entering scores.</Muted>
      ) : (
        <ScoreGrid checkpoints={checkpoints} teams={teams} />
      )}
    </div>
  );
}
