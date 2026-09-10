import { PrismaClient } from '@prisma/client';

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: Cannot run complete reset in production.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log('Starting FULL cleanup of application data for TEST database...');

  await prisma.$connect();

  // Audit logs (usually safe to wipe in dev)
  const auditLogs = await prisma.auditLog.deleteMany();
  
  // Notifications & Achievements & TokenLedgers (dependent on Participants or Teams)
  const notifications = await prisma.notification.deleteMany();
  const achievements = await prisma.achievement.deleteMany();
  const tokenLedgers = await prisma.tokenLedger.deleteMany();
  
  // GitHub activities & Ethics (dependent on Participants)
  const githubActivities = await prisma.githubActivity.deleteMany();
  const ethicsAcceptances = await prisma.ethicsAcceptance.deleteMany();
  
  // Submission Analytics (dependent on WeeklySubmissions)
  const submissionAnalytics = await prisma.submissionAnalytics.deleteMany();
  
  // WeeklySubmissions, Scores, Evaluations, Projects (dependent on Teams)
  const submissions = await prisma.weeklySubmission.deleteMany();
  const scores = await prisma.score.deleteMany();
  const evaluations = await prisma.evaluation.deleteMany();
  const projects = await prisma.project.deleteMany();

  // Participants (dependent on Teams)
  const participants = await prisma.participant.deleteMany();
  
  // Teams
  const teams = await prisma.team.deleteMany();
  
  // Registration members (dependent on Registrations)
  const registrationMembers = await prisma.registrationMember.deleteMany();
  
  // Registrations
  const registrations = await prisma.registration.deleteMany();
  
  // Announcements (safe to wipe test announcements)
  const announcements = await prisma.announcement.deleteMany();

  const other = 
      auditLogs.count + 
      notifications.count + 
      achievements.count + 
      tokenLedgers.count + 
      ethicsAcceptances.count + 
      submissionAnalytics.count + 
      projects.count + 
      announcements.count;

  console.log(`
Deleted:
- Teams: ${teams.count}
- Registrations: ${registrations.count}
- Participants: ${participants.count}
- Submissions: ${submissions.count}
- Evaluations: ${evaluations.count}
- Scores: ${scores.count}
- GitHub activity: ${githubActivities.count}
- Other application records: ${other}
  `);

  console.log('Verifying 0 remaining application records...');

  const counts = {
    teams: await prisma.team.count(),
    registrations: await prisma.registration.count(),
    participants: await prisma.participant.count(),
    submissions: await prisma.weeklySubmission.count(),
    evaluations: await prisma.evaluation.count(),
    scores: await prisma.score.count(),
    githubActivity: await prisma.githubActivity.count()
  };

  console.log(`
Remaining:
- Teams: ${counts.teams}
- Registrations: ${counts.registrations}
- Participants: ${counts.participants}
- Submissions: ${counts.submissions}
- Evaluations: ${counts.evaluations}
- Scores: ${counts.scores}
- GitHub activity: ${counts.githubActivity}
  `);
  
  const testItems = await prisma.registration.findMany({
    where: {
      OR: [
        { teamName: { contains: 'Code', mode: 'insensitive' } },
        { members: { some: { githubUsername: { in: ['Mani2815', 'slavenderickpais', 'itcodehery'] } } } }
      ]
    }
  });

  console.log(`Old "Code" team: ${testItems.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
  console.log(`Old test GitHub usernames: ${testItems.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
}

main()
  .catch((e) => {
    console.error('Error during reset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
