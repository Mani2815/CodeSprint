import { requireParticipantSession } from '@/lib/participant-auth';
import { prisma } from '@/lib/prisma';
import { H1, Muted } from '@/components/shared/typography';
import { ProfileForm } from '@/features/dashboard/components/profile-form';

export default async function ProfilePage() {
  const session = await requireParticipantSession();
  const participantId = session.user.participantId!;

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!participant) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-8">
      <div>
        <H1 className="text-3xl">Profile</H1>
        <Muted className="mt-2">Manage your personal settings and profile information.</Muted>
      </div>

      <ProfileForm participant={participant} />
    </div>
  );
}
