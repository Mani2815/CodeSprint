import { prisma } from '@/lib/prisma';
import { EventList } from '@/features/events/components/event-list';
import { requireAdminPageSession } from '@/lib/auth-guards';

export const metadata = {
  title: 'Events | Admin Dashboard',
};

export default async function EventsPage() {
  await requireAdminPageSession();

  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      checkpoints: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="mt-2 text-muted-foreground">Manage CodeSprint events and checkpoints.</p>
      </div>
      <EventList events={events} />
    </div>
  );
}
