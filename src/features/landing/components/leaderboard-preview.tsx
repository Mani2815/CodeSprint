import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';
import { getLeaderboard } from '@/services/leaderboard-service';
import { ACTIVE_EVENT_SLUG, ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/shared/motion';
import { Eyebrow, H2, Text } from '@/components/shared/typography';

export async function LeaderboardPreviewSection() {
  const allTeams = await getLeaderboard(ACTIVE_EVENT_SLUG);
  const topTeams = allTeams.slice(0, 5);

  return (
    <section className="border-t border-border bg-surface/10">
      <div className="container py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Standings</Eyebrow>
          <H2 className="mt-3">Current Leaderboard</H2>
          <Text className="mt-3 text-muted-foreground">
            The top 5 teams currently leading the CodeSprint.
          </Text>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-12 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="grid grid-cols-[4rem_1fr_6rem] items-center gap-4 border-b border-border bg-surface/50 px-6 py-4 text-sm font-medium text-muted-foreground sm:grid-cols-[5rem_1fr_8rem]">
              <div>Rank</div>
              <div>Team</div>
              <div className="text-right">Score</div>
            </div>

            <div className="divide-y divide-border/50">
              {topTeams.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No scores recorded yet. Check back after the first evaluation!
                </div>
              ) : (
                topTeams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="grid grid-cols-[4rem_1fr_6rem] items-center gap-4 px-6 py-4 sm:grid-cols-[5rem_1fr_8rem]"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {idx === 0 && <Trophy className="size-4 text-yellow-500" />}
                      <span className={idx === 0 ? 'text-yellow-500' : 'text-muted-foreground'}>
                        #{idx + 1}
                      </span>
                    </div>
                    <div className="truncate font-medium">{team.name}</div>
                    <div className="text-right font-mono font-semibold">{team.totalScore}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline">
              <Link href={ROUTES.LEADERBOARD}>
                View Full Leaderboard
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
