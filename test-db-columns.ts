import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'teams';
  `;
  console.log(result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
