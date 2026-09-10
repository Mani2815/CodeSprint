import { PrismaClient } from '@prisma/client';
import { ACTIVE_EVENT_SLUG } from '../src/lib/constants';

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Cannot run dev scripts in production.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const weekNumber = parseInt(process.argv[2] || '1', 10);
  
  const event = await prisma.event.findUnique({ where: { slug: ACTIVE_EVENT_SLUG } });
  if (!event) throw new Error('Active event not found');

  // Deactivate all checkpoints for the event to ensure only one is active
  await prisma.checkpoint.updateMany({
    where: { eventId: event.id },
    data: { isActive: false },
  });

  // Activate target week
  await prisma.checkpoint.update({
    where: { eventId_order: { eventId: event.id, order: weekNumber } },
    data: { 
      isActive: true,
      createdAt: new Date(), // Resets the 7-day submission deadline
      leaderboardReleaseDate: null, // Keep leaderboard unreleased initially
    },
  });

  console.log(`Successfully activated Week ${weekNumber} for testing.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
