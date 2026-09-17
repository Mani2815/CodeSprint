import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const analytics = await prisma.submissionAnalytics.findMany();
  for (const a of analytics) {
    console.log(`Submission ${a.submissionId}:`);
    const metrics = a.memberMetrics as any;
    console.log('Is Array?', Array.isArray(metrics));
    if (!Array.isArray(metrics)) {
      console.log('Daily keys:', Object.keys(metrics.daily || {}));
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
