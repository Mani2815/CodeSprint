import { getServerSession, type Session } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Every mutating admin API route calls this first. Middleware already
 * blocks unauthenticated requests to /api/teams and /api/scores, but
 * checking again here means these routes are safe even if called from a
 * context middleware doesn't cover (defense in depth, same pattern as the
 * (authenticated) layout in Phase 6).
 */
export async function requireAdminSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 'admin') {
    return null;
  }

  return session;
}
