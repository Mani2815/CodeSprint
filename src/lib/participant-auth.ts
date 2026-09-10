import { requireParticipantPageSession } from '@/lib/auth-guards';

export async function requireParticipantSession() {
  return requireParticipantPageSession();
}
