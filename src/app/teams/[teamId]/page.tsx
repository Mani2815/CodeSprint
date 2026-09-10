import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { H1, Muted } from '@/components/shared/typography';
import { getTeamPublicProfile } from '@/services/team-service';

export const dynamic = 'force-dynamic';
export default async function TeamProfilePage({ params }: { params: { teamId: string } }) {
  const team = await getTeamPublicProfile(params.teamId);
  if (!team) notFound();
  const total = team.scores.reduce((sum, score) => sum + score.value, 0);
  return (
    <>
      <Navbar />
      <main className="container max-w-4xl space-y-8 py-12">
        <div>
          <H1>{team.name}</H1>
          <Muted className="mt-2">
            {team.college ?? 'CodeSprint team'} · {total} overall points
          </Muted>
        </div>
        {team.project && (
          <section className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">{team.project.name}</h2>
            <p className="mt-2 text-muted-foreground">{team.project.description}</p>
            {team.project.repoUrl && (
              <a href={team.project.repoUrl} className="mt-3 inline-block text-primary underline">
                View repository
              </a>
            )}
          </section>
        )}
        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Members</h2>
          <ul className="mt-3 space-y-2">
            {team.participants.map((p) => (
              <li key={p.id}>
                {p.name ?? p.githubUsername}{' '}
                <span className="text-muted-foreground">@{p.githubUsername}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Weekly scores</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {team.scores.map((s) => (
              <div key={s.id} className="rounded-lg bg-surface p-3">
                <p className="text-sm text-muted-foreground">{s.checkpoint.label}</p>
                <p className="text-2xl font-semibold">{s.value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
