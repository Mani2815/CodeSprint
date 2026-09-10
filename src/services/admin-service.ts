import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const SALT_ROUNDS = 12;

export interface AuthenticatedAdmin {
  id: string;
  username: string;
  displayName: string | null;
}

/**
 * Verifies a username/password pair against the admins table.
 *
 * Deliberately returns `null` for both "no such user" and "wrong password"
 * — the caller (NextAuth `authorize`) must surface a single generic error
 * so failed logins can't be used to enumerate valid usernames.
 */
export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<AuthenticatedAdmin | null> {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    // Run a dummy hash comparison so a nonexistent-username request takes
    // roughly the same time as a wrong-password request (timing-attack hygiene).
    await bcrypt.compare(
      password,
      '$2a$12$invalidsaltinvalidsaltinvalidsalu.invalidhasedvaluexxxxxx'
    );
    return null;
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) return null;

  return { id: admin.id, username: admin.username, displayName: admin.displayName };
}

export async function touchLastLogin(adminId: string): Promise<void> {
  await prisma.admin.update({
    where: { id: adminId },
    data: { lastLoginAt: new Date() },
  });
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}
