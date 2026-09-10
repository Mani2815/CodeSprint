import { H1, Muted } from '@/components/shared/typography';
import { getActiveEventId } from '@/services/event-service';
import { listRegistrations } from '@/services/registration-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
import { RegistrationActions } from '@/features/registrations/components/registration-actions';
export const dynamic = 'force-dynamic';
export default async function RegistrationsPage() {
  const registrations = await listRegistrations(await getActiveEventId(ACTIVE_EVENT_SLUG));
  return (
    <div className="space-y-8">
      <div>
        <H1 className="text-3xl">Registrations</H1>
        <Muted className="mt-1">Review incoming team requests.</Muted>
      </div>
      <div className="space-y-4">
        {registrations.map((r) => (
          <article key={r.id} className="rounded-xl border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{r.teamName}</h2>
                <p className="text-sm text-muted-foreground">
                  {r.projectName} · {r.college}
                </p>
                <p className="mt-2 text-sm">
                  {r.members
                    .map(
                      (m) =>
                        `${m.name} (@${m.githubUsername}) ${m.className ? `[${m.className}]` : ''} ${m.regNo ? `[${m.regNo}]` : ''}`
                    )
                    .join(', ')}
                </p>
              </div>
              <RegistrationActions id={r.id} status={r.status} />
            </div>
            {r.rejectionReason && (
              <p className="mt-3 text-sm text-error">Reason: {r.rejectionReason}</p>
            )}
          </article>
        ))}
        {registrations.length === 0 && <Muted>No registrations yet.</Muted>}
      </div>
    </div>
  );
}
