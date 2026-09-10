import { PrismaClient } from '@prisma/client';
import { ACTIVE_EVENT_SLUG, ETHICS_VERSION } from '../src/lib/constants';

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Cannot run test seed in production.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const githubUsername = process.argv[2] || 'test-user-local';

  const event = await prisma.event.findUnique({ where: { slug: ACTIVE_EVENT_SLUG } });
  if (!event) throw new Error('Active event not found');

  const team = await prisma.team.upsert({
    where: { eventId_name: { eventId: event.id, name: 'TEST_TEAM_LOCAL' } },
    update: {},
    create: {
      eventId: event.id,
      name: 'TEST_TEAM_LOCAL',
      college: 'Test College',
    },
  });

  const participant = await prisma.participant.upsert({
    where: { githubId: githubUsername },
    update: { teamId: team.id },
    create: {
      githubId: githubUsername,
      githubUsername: githubUsername,
      name: `Test User (${githubUsername})`,
      teamId: team.id,
    },
  });

  await prisma.ethicsAcceptance.upsert({
    where: {
      participantId_version: {
        participantId: participant.id,
        version: ETHICS_VERSION,
      },
    },
    update: {},
    create: {
      participantId: participant.id,
      version: ETHICS_VERSION,
    },
  });

  console.log(`Test team TEST_TEAM_LOCAL and participant ${githubUsername} seeded successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
