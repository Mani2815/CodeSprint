import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfill() {
  console.log('Starting backfill...');
  const participants = await prisma.participant.findMany({
    where: {
      OR: [
        { className: null },
        { regNo: null },
        { className: '' },
        { regNo: '' }
      ]
    }
  });

  console.log(`Found ${participants.length} participants missing data.`);

  let updated = 0;
  for (const p of participants) {
    const regMember = await prisma.registrationMember.findFirst({
      where: {
        githubUsername: { equals: p.githubUsername, mode: 'insensitive' }
      },
      orderBy: { registration: { createdAt: 'desc' } }
    });

    if (regMember && (regMember.className || regMember.regNo)) {
      await prisma.participant.update({
        where: { id: p.id },
        data: {
          className: regMember.className,
          regNo: regMember.regNo
        }
      });
      console.log(`Updated participant ${p.githubUsername}: Class=${regMember.className}, RegNo=${regMember.regNo}`);
      updated++;
    }
  }

  console.log(`Backfill complete. Updated ${updated} participants.`);
}

backfill()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
