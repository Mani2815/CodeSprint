import { AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Eyebrow, H1, Muted } from '@/components/shared/typography';
import { LeaderboardView } from '@/features/leaderboard/components/leaderboard-view';
import { RefreshButton } from '@/features/leaderboard/components/refresh-button';
import { getLeaderboardView } from '@/services/leaderboard-service';
import { EventNotFoundError } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import type { CheckpointColumn, LeaderboardRow } from '@/features/leaderboard/types';

export const metadata = {
  title: 'Leaderboard',
};

// Scores change only when an organizer saves them (no real-time sync), but
// this page is the one place participants expect to see the truth the
// moment they load or refresh it — never serve a stale cached version.
export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  let checkpoints: CheckpointColumn[] = [];
  let rows: LeaderboardRow[] = [];
  let eventNotSeeded = false;

  try {
    const view = await getLeaderboardView(ACTIVE_EVENT_SLUG);
    checkpoints = view.checkpoints.map((cp) => ({ id: cp.id, label: cp.label, order: cp.order }));
    rows = view.ranked.map((team) => ({
      rank: team.rank,
      id: team.id,
      name: team.name,
      totalScore: team.totalScore,
      checkpointScores: view.checkpoints.map((cp) => team.scoresByCheckpoint[cp.order] ?? 0),
      lastUpdated: team.lastUpdated ? team.lastUpdated.toISOString() : null,
    }));
  } catch (err) {
    if (err instanceof EventNotFoundError) {
      eventNotSeeded = true;
    } else {
      throw err;
    }
  }

  return (
    <>
      <Navbar />
      <main className="container max-w-6xl py-10 sm:py-14">
        <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Live Standings</Eyebrow>
            <H1 className="mt-2 text-3xl sm:text-4xl">Leaderboard</H1>
            <Muted className="mt-2">
              Updated by organizers after every checkpoint. Refresh anytime for the latest scores.
            </Muted>
          </div>
          <RefreshButton />
        </div>

        <div className="pt-8">
          {eventNotSeeded ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-warning/15 text-warning">
                <AlertTriangle className="size-6" />
              </div>
              <Muted className="max-w-sm">
                The leaderboard isn&apos;t set up yet. Check back once the event begins.
              </Muted>
            </div>
          ) : (
            <LeaderboardView rows={rows} checkpoints={checkpoints} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
