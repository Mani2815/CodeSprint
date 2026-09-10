import { CalendarDays, Users, Laptop, ClipboardCheck, Trophy } from 'lucide-react';
import { Reveal } from '@/components/shared/motion';
import { Eyebrow, H2, Text } from '@/components/shared/typography';
import { ORG_NAME } from '@/lib/constants';

const features = [
  {
    icon: CalendarDays,
    title: '2 Weeks',
    description: 'An intensive month-long journey of rapid development.',
  },
  {
    icon: Users,
    title: '2 Members',
    description: 'Form a specialized squad to tackle challenges together.',
  },
  {
    icon: Laptop,
    title: '2 Weekly Projects',
    description: 'Build and showcase a brand-new project every week.',
  },
  {
    icon: ClipboardCheck,
    title: 'Weekly Evaluation',
    description: 'Get scored by faculty on technical, UX, and presentation criteria.',
  },
  {
    icon: Trophy,
    title: 'Overall Champion',
    description: 'Climb the global leaderboard to claim the CodeSprint title.',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="border-t border-border bg-surface/30">
      <div className="container py-20 sm:py-28">
        <Reveal className="text-center sm:text-left">
          <Eyebrow>About</Eyebrow>
          <H2 className="mt-3">What is CodeSprint?</H2>
        </Reveal>

        <Reveal delay={0.1} className="mt-6 max-w-2xl text-center sm:text-left">
          <Text>
            CodeSprint is {ORG_NAME}&apos;s signature 4-week software development competition. Teams
            race against the clock to design, build, and deliver a new project each week, facing
            weekly faculty evaluations that determine their standings.
          </Text>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={0.15 + i * 0.05}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-colors hover:border-primary/20">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
