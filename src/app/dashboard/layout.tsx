import { requireParticipantSession } from '@/lib/participant-auth';
import { getParticipantById } from '@/services/participant-service';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { ParticipantDashboardShell } from '@/components/layout/participant-dashboard-shell';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireParticipantSession();

  const participantId = session.user.participantId!;
  const participant = await getParticipantById(participantId);

  if (!participant) {
    redirect(`${ROUTES.PARTICIPANT_LOGIN}?error=session_expired`);
  }

  const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);

  // Get active week
  const activeCheckpoint = await prisma.checkpoint.findFirst({
    where: { eventId, isActive: true },
    orderBy: { order: 'asc' },
  });
  const currentWeek = activeCheckpoint?.label ?? 'Week 1';

  // Get overall score
  let overallScore = 0;
  if (participant.teamId) {
    const scores = await prisma.score.findMany({
      where: { teamId: participant.teamId },
    });
    overallScore = scores.reduce((sum, score) => sum + score.value, 0);
  }

  // Get unread notifications
  const unreadCount = await prisma.notification.count({
    where: { participantId, isRead: false },
  });

  return (
    <ParticipantDashboardShell
      participant={participant}
      currentWeek={currentWeek}
      overallScore={overallScore}
      unreadNotifications={unreadCount}
    >
      {children}
    </ParticipantDashboardShell>
  );
}
