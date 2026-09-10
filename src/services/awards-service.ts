import { prisma } from '@/lib/prisma';

export async function getWeeklyAwards(eventId: string, checkpointOrder: number) {
  const checkpoint = await prisma.checkpoint.findUnique({
    where: { eventId_order: { eventId, order: checkpointOrder } },
  });
  if (!checkpoint) return null;
  const [bestProject, activities] = await Promise.all([
    prisma.score.findFirst({
      where: { checkpointId: checkpoint.id },
      include: { team: true },
      orderBy: { value: 'desc' },
    }),
    prisma.githubActivity.findMany({
      where: { sprintWeekId: checkpoint.id },
      include: { participant: { include: { team: true } } },
    }),
  ]);
  const contributorTotals = new Map<string, { name: string; value: number }>();
  const teamTotals = new Map<string, { name: string; value: number; members: number[] }>();
  for (const activity of activities) {
    const value = activity.commitCount + activity.prCount;
    const participant = activity.participant;
    const contributor = contributorTotals.get(participant.id) ?? {
      name: participant.name ?? participant.githubUsername,
      value: 0,
    };
    contributor.value += value;
    contributorTotals.set(participant.id, contributor);
    if (participant.team) {
      const team = teamTotals.get(participant.team.id) ?? {
        name: participant.team.name,
        value: 0,
        members: [],
      };
      team.value += value;
      team.members.push(value);
      teamTotals.set(participant.team.id, team);
    }
  }
  const top = <T extends { value: number }>(values: T[]) =>
    values.sort((a, b) => b.value - a.value)[0] ?? null;
  const collaboration =
    [...teamTotals.values()]
      .filter((team) => team.members.length > 1)
      .sort((a, b) => {
        const spread = (x: number[]) => Math.max(...x) - Math.min(...x);
        return spread(a.members) - spread(b.members) || b.value - a.value;
      })[0] ?? null;
  return {
    checkpoint,
    bestProject: bestProject ? { team: bestProject.team.name, score: bestProject.value } : null,
    mostActiveTeam: top([...teamTotals.values()]),
    mostActiveContributor: top([...contributorTotals.values()]),
    bestCollaboration: collaboration
      ? { name: collaboration.name, value: collaboration.value }
      : null,
  };
}
