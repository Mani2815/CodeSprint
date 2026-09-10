import { getServerSession, type Session } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES, ETHICS_VERSION } from '@/lib/constants';
import { hasAcceptedEthics } from '@/services/participant-service';

export async function requireAdminPageSession(): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (session?.user.role === 'admin') {
    return session;
  }

  if (session?.user.role === 'participant') {
    redirect(ROUTES.DASHBOARD);
  }

  redirect(ROUTES.PARTICIPANT_LOGIN);
}

export async function requireParticipantPageSession(): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (session?.user.role === 'revoked') {
    redirect('/login?error=access_revoked');
  }

  if (session?.user.role === 'participant' && session.user.participantId) {
    if (!(await hasAcceptedEthics(session.user.participantId, ETHICS_VERSION))) {
      redirect(ROUTES.ETHICS);
    }

    return session;
  }

  if (session?.user.role === 'admin') {
    redirect(ROUTES.ADMIN_DASHBOARD);
  }

  redirect(ROUTES.PARTICIPANT_LOGIN);
}
