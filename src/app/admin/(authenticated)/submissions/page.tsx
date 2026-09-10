import Link from 'next/link';
import { H1, Muted } from '@/components/shared/typography';
import { getActiveEventId } from '@/services/event-service';
import { listSubmissions } from '@/services/submission-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
export const dynamic = 'force-dynamic';
export default async function AdminSubmissionsPage() {
  const submissions = await listSubmissions(await getActiveEventId(ACTIVE_EVENT_SLUG));
  return (
    <div className="space-y-8">
      <div>
        <H1 className="text-3xl">Weekly submissions</H1>
        <Muted className="mt-1">
          GitHub verification is informational; faculty scores remain manual.
        </Muted>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4">Team</th>
              <th className="p-4">Week</th>
              <th className="p-4">Project</th>
              <th className="p-4">Verification</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id} className="border-b">
                <td className="p-4">{submission.team.name}</td>
                <td className="p-4">{submission.checkpoint.label}</td>
                <td className="p-4">
                  <Link
                    className="text-primary underline"
                    href={`/admin/submissions/${submission.id}`}
                  >
                    {submission.projectTitle}
                  </Link>
                </td>
                <td className="p-4">{submission.verificationStatus.replaceAll('_', ' ')}</td>
              </tr>
            ))}
            {submissions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No weekly submissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
