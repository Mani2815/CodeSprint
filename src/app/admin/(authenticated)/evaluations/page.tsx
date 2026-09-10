import { H1, Muted } from '@/components/shared/typography';
import { getActiveEventId } from '@/services/event-service';
import { listEvaluations } from '@/services/evaluation-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
export const dynamic = 'force-dynamic';
export default async function EvaluationsPage() {
  const evaluations = await listEvaluations(await getActiveEventId(ACTIVE_EVENT_SLUG));
  return (
    <div className="space-y-8">
      <div>
        <H1 className="text-3xl">Evaluations</H1>
        <Muted className="mt-1">
          Rubric totals are automatically published to the leaderboard.
        </Muted>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4">Team</th>
              <th className="p-4">Week</th>
              <th className="p-4">Total</th>
              <th className="p-4">Feedback</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((e) => (
              <tr key={e.id} className="border-b">
                <td className="p-4 font-medium">{e.team.name}</td>
                <td className="p-4">{e.checkpoint.label}</td>
                <td className="p-4">{e.total}</td>
                <td className="p-4">{e.comments ?? '—'}</td>
              </tr>
            ))}
            {evaluations.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No evaluations yet. Submit them through POST /api/evaluations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
