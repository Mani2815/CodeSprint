/**
 * Provisions an admin account. There is no registration UI on purpose —
 * per the brief, admins are provisioned out-of-band by whoever controls
 * the database/deployment, not via a public sign-up form.
 *
 * Usage:
 *   npx tsx scripts/create-admin.ts <username> <password> [displayName]
 *
 * Example:
 *   npx tsx scripts/create-admin.ts organizer1 "a-strong-password" "Priya"
 */
import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/services/admin-service';

async function main() {
  const [username, password, displayName] = process.argv.slice(2);

  if (!username || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <username> <password> [displayName]');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    console.error(`An admin with username "${username}" already exists.`);
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.admin.create({
    data: { username, passwordHash, displayName: displayName ?? null },
  });

  console.warn(`Created admin "${admin.username}" (id: ${admin.id}).`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
