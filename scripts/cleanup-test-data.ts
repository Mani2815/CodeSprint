import { PrismaClient } from '@prisma/client';

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Cannot run test cleanup in production.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log('Starting safe cleanup of test data...');

  const team = await prisma.team.findFirst({ where: { name: 'TEST_TEAM_LOCAL' } });
  if (team) {
    await prisma.participant.deleteMany({ where: { teamId: team.id } });
    await prisma.team.delete({ where: { id: team.id } });
    console.log('Deleted TEST_TEAM_LOCAL and its participants/submissions.');
  } else {
    console.log('TEST_TEAM_LOCAL not found. Nothing to clean up.');
  }
}

main()
  .catch((e) => {
    console.error('Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
