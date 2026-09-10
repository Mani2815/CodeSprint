import { H1, Muted } from '@/components/shared/typography';
import { TeamList } from '@/features/teams/components/team-list';
import { listTeams } from '@/services/team-service';
import { getActiveEventId, EventNotFoundError } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import type { TeamRow } from '@/features/teams/types';

export const metadata = {
  title: 'Teams',
};

export const dynamic = 'force-dynamic';

export default async function AdminTeamsPage() {
  let teams: TeamRow[] = [];
  let eventNotSeeded = false;

  try {
    const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
    const rows = await listTeams(eventId);
    teams = rows.map((t) => ({ id: t.id, name: t.name, createdAt: t.createdAt.toISOString() }));
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
        <H1 className="text-3xl sm:text-4xl">Teams</H1>
        <Muted className="mt-1">Add, edit, and remove participating teams.</Muted>
      </div>

      {eventNotSeeded ? (
        <Muted>Run `npm run db:seed` to set up the event before adding teams.</Muted>
      ) : (
        <TeamList teams={teams} />
      )}
    </div>
  );
}
