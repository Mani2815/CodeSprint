import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sub = await prisma.weeklySubmission.findFirst({
    where: { repositoryUrl: { contains: 'Mani2815/code-test' } },
    include: {
      team: { include: { participants: true } },
      checkpoint: true,
      analytics: true,
    }
  });
  console.log('Submission DB State:', JSON.stringify(sub, null, 2));
  
  if (sub?.team) {
    const activities = await prisma.githubActivity.findMany({
      where: { participantId: { in: sub.team.participants.map(p => p.id) } }
    });
    console.log('GithubActivities in DB:', JSON.stringify(activities, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
