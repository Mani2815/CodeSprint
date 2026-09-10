import { PrismaClient } from '@prisma/client';
import { upsertParticipant, isParticipantAllowed } from '../src/services/participant-service';

const prisma = new PrismaClient();

async function simulate() {
  console.log('--- Starting Authentication Simulation ---');
  
  const event = await prisma.event.findFirst();
  if (!event) throw new Error('No events found in DB to attach team to.');

  const team = await prisma.team.create({
    data: {
      eventId: event.id,
      name: 'Team Alpha',
      participants: {
        create: [
          {
            name: 'Member 1',
            githubUsername: 'member1_gh',
            githubId: 'registration:member1_gh',
          },
          {
            name: 'Member 2',
            githubUsername: 'member2_gh',
            githubId: 'registration:member2_gh',
          },
          {
            name: 'Member 3',
            githubUsername: 'member3_gh',
            githubId: 'registration:member3_gh',
          }
        ]
      }
    },
    include: { participants: true }
  });
  
  console.log(`Created Team Alpha with ${team.participants.length} participants.`);

  // 2. Simulate Member 1 Login
  console.log('\nSimulating Member 1 Login...');
  const member1Allowed = await isParticipantAllowed('real_github_id_1', 'member1_gh');
  console.log(`Member 1 Allowed? ${member1Allowed}`);
  if (member1Allowed) {
    const p1 = await upsertParticipant({
      githubId: 'real_github_id_1',
      githubUsername: 'member1_gh',
      name: 'Member 1 Real Name',
      avatarUrl: 'https://avatar/1',
    });
    console.log(`Member 1 Linked successfully. ID: ${p1.id}, githubId: ${p1.githubId}`);
  }

  // 3. Simulate Member 2 Login
  console.log('\nSimulating Member 2 Login...');
  const member2Allowed = await isParticipantAllowed('real_github_id_2', 'member2_gh');
  console.log(`Member 2 Allowed? ${member2Allowed}`);
  if (member2Allowed) {
    const p2 = await upsertParticipant({
      githubId: 'real_github_id_2',
      githubUsername: 'member2_gh',
      name: 'Member 2 Real Name',
      avatarUrl: 'https://avatar/2',
    });
    console.log(`Member 2 Linked successfully. ID: ${p2.id}, githubId: ${p2.githubId}`);
  }

  // 4. Simulate Unauthorized Login
  console.log('\nSimulating Unauthorized Login...');
  const hackerAllowed = await isParticipantAllowed('hacker_id', 'hacker_gh');
  console.log(`Hacker Allowed? ${hackerAllowed}`);

  // 5. Simulate Member 1 Subsequent Login
  console.log('\nSimulating Member 1 Subsequent Login...');
  const p1Subsequent = await upsertParticipant({
    githubId: 'real_github_id_1',
    githubUsername: 'member1_gh_changed', // Changed username on Github
    name: 'Member 1 Real Name',
    avatarUrl: 'https://avatar/1',
  });
  console.log(`Member 1 Subsequent Login successful. Updated username: ${p1Subsequent.githubUsername}`);
  
  // Clean up
  await prisma.participant.deleteMany({ where: { teamId: team.id } });
  await prisma.team.delete({ where: { id: team.id } });
  console.log('\nCleaned up simulation data.');
}

simulate()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
