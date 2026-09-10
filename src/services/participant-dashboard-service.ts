import { prisma } from '@/lib/prisma';
import { getActiveEventId } from '@/services/event-service';
import { ACTIVE_EVENT_SLUG, EVENT_SCHEDULE } from '@/lib/constants';
import { getLeaderboard } from '@/services/leaderboard-service';

export async function getParticipantDashboardData(participantId: string) {
  const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    include: {
      team: {
        include: {
          submissions: {
            include: { analytics: true },
            orderBy: { checkpoint: { order: 'desc' } },
          },
          evaluations: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { checkpoint: true },
          },
        },
      },
      githubActivities: true,
    },
  });

  if (!participant) throw new Error('Participant not found');

  const activeCheckpoint = await prisma.checkpoint.findFirst({
    where: { eventId, isActive: true },
    orderBy: { order: 'asc' },
  });

  const currentWeek = activeCheckpoint?.label ?? 'Week 1';
  let nextDeadline = new Date();
  if (activeCheckpoint) {
    if (activeCheckpoint.order === 1) {
      nextDeadline = new Date(EVENT_SCHEDULE.WEEK_1_DEADLINE);
    } else if (activeCheckpoint.order === 2) {
      nextDeadline = new Date(EVENT_SCHEDULE.WEEK_2_DEADLINE);
    }
  }

  const hasReleasedLeaderboard = await prisma.checkpoint.findFirst({
    where: { eventId, leaderboardReleaseDate: { lte: new Date() } },
  });
  const isRanked = hasReleasedLeaderboard !== null;

  const leaderboard = await getLeaderboard(ACTIVE_EVENT_SLUG);
  let currentRank = 0;
  let overallScore = 0;

  if (isRanked && participant.teamId) {
    const rankIndex = leaderboard.findIndex((t) => t.id === participant.teamId);
    currentRank = rankIndex !== -1 ? rankIndex + 1 : 0;
    overallScore = leaderboard[rankIndex]?.totalScore ?? 0;
  }

  const projectsSubmitted = participant.team?.submissions.length ?? 0;

  const latestSubmission = participant.team?.submissions[0] ?? null;
  const analytics = latestSubmission?.analytics ?? null;

  const githubSummary = {
    commits: analytics?.totalCommits ?? 0,
    prs: analytics?.pullRequestCount ?? 0,
    lastSync: analytics?.syncedAt ?? null,
  };

  const latestEvaluation = participant.team?.evaluations[0] ?? null;

  const latestAnnouncement = await prisma.announcement.findFirst({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  });

  return {
    currentWeek,
    overallScore,
    currentRank,
    projectsSubmitted,
    githubSummary,
    latestEvaluation,
    nextDeadline,
    latestAnnouncement,
    teamId: participant.teamId,
    isRanked,
  };
}
