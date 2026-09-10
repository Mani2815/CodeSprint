import { requireParticipantSession } from '@/lib/participant-auth';
import { prisma } from '@/lib/prisma';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { getActiveEventId } from '@/services/event-service';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Megaphone, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function AnnouncementsPage() {
  const session = await requireParticipantSession();
  const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
  const participantId = session.user.participantId!;

  const announcements = await prisma.announcement.findMany({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  });

  // Mark announcement notifications as read
  await prisma.notification.updateMany({
    where: {
      participantId,
      type: 'ANNOUNCEMENT',
      isRead: false,
    },
    data: { isRead: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
      <div>
        <H1 className="text-3xl">Announcements</H1>
        <Muted className="mt-2">
          Important updates and information from the CodeSprint organizers.
        </Muted>
      </div>

      <div className="space-y-6">
        {announcements.length > 0 ? (
          announcements.map((announcement, index) => {
            const isNew =
              index === 0 &&
              Date.now() - announcement.createdAt.getTime() < 3 * 24 * 60 * 60 * 1000; // 3 days
            return (
              <Card key={announcement.id} className={isNew ? 'border-primary/50 bg-primary/5' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {announcement.createdAt.toLocaleDateString()} at{' '}
                        {announcement.createdAt.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </CardDescription>
                    </div>
                    {isNew && <Badge>New</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {announcement.content}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed bg-surface/30 p-12 text-center">
            <Megaphone className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">No announcements yet</p>
            <Muted className="mt-1">Check back later for updates from the organizers.</Muted>
          </div>
        )}
      </div>
    </div>
  );
}
