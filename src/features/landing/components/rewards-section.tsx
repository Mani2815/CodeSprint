import { Medal, Star, GitCommit, ScrollText, User } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/shared/motion';
import { Eyebrow, H2, Text, H4 } from '@/components/shared/typography';

const overallWinners = [
  {
    icon: Medal,
    title: 'Winner',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    perks: [
      'Premium AI Tools Subscription',
      'Featured on the CodeSprint Hall of Fame',
      'Official Winner Certificate',
    ],
  },
  {
    icon: Medal,
    title: 'Runner-Up',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10',
    perks: ['Premium AI Tools Subscription', 'Official Runner-Up Certificate'],
  },
];

const weeklyAwards = [
  {
    icon: Star,
    title: 'Best Project of the Week',
    perks: ['Exclusive Digital (E-) Badge', 'Featured on Weekly Winners'],
  },
  {
    icon: GitCommit,
    title: 'Highest Commit Team of the Week',
    perks: ['Exclusive Digital (E-) Badge', 'Featured on Weekly Winners'],
  },
  {
    icon: User,
    title: 'Outstanding Contributor of the Week',
    perks: ['Exclusive Digital (E-) Badge', 'Featured on Weekly Winners'],
  },
];

export function RewardsSection() {
  return (
    <section id="rewards" className="border-t border-border bg-surface/30">
      <div className="container py-20 sm:py-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Eyebrow>Rewards & Prizes</Eyebrow>
          <H2 className="mt-3">Rewards & Prizes</H2>
          <Text className="mt-4 text-muted-foreground">
            Compete, innovate, and earn exciting rewards throughout CodeSprint. Outstanding teams
            and participants will be recognized for their creativity, technical excellence, and
            consistent performance.
          </Text>
        </Reveal>

        {/* Overall Winners */}
        <div className="mt-20">
          <Reveal>
            <H4 className="mb-8 text-center sm:text-left">Overall Competition Winners</H4>
          </Reveal>
          <Stagger className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {overallWinners.map((winner) => (
              <StaggerItem key={winner.title}>
                <div className="flex h-full flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex size-14 items-center justify-center rounded-2xl ${winner.bgColor} ${winner.color}`}
                    >
                      <winner.icon className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{winner.title}</h3>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {winner.perks.map((perk, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Weekly Recognition */}
        <div className="mt-20">
          <Reveal>
            <H4 className="mb-8 text-center sm:text-left">Weekly Recognition</H4>
          </Reveal>
          <Stagger className="grid gap-6 md:grid-cols-3">
            {weeklyAwards.map((award) => (
              <StaggerItem key={award.title}>
                <div className="flex h-full flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <award.icon className="size-7" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{award.title}</h3>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {award.perks.map((perk, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Participation Certificate */}
        <div className="mt-12">
          <Reveal>
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center shadow-sm transition-all hover:border-primary/20 hover:shadow-md sm:flex-row sm:text-left">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ScrollText className="size-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Participation Certificate</h3>
                <p className="mt-2 text-muted-foreground">
                  Every participant who successfully completes CodeSprint will receive an Official
                  E-Certificate of Participation.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
