import { Lightbulb, Code2, Layout, BookOpen, Users, CheckSquare, Globe2, Target, Github, Clock } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/shared/motion';
import { Eyebrow, H2, Text } from '@/components/shared/typography';

const criteria = [
  {
    icon: Target,
    title: 'Problem Understanding',
    description: 'Clarity and relevance of the problem being solved.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation & Creativity',
    description: 'Originality and creativity of the solution.',
  },
  {
    icon: CheckSquare,
    title: 'Functionality',
    description: 'Working features, completeness, and correctness.',
  },
  {
    icon: Code2,
    title: 'Technical Implementation',
    description: 'Architecture, code quality, and technology choices.',
  },
  { icon: Layout, title: 'UI/UX & Design', description: 'Design, usability, and responsiveness.' },
  { icon: BookOpen, title: 'Documentation', description: 'README quality and code clarity.' },
  {
    icon: Globe2,
    title: 'Impact & Practicality',
    description: 'Real-world impact and SDG alignment.',
  },
  {
    icon: Github,
    title: 'GitHub & Team Contribution',
    description: 'Commit activity, PRs, and meaningful contribution from both members.',
  },
  {
    icon: Clock,
    title: 'Timely Submission',
    description: 'Submitting within the configured window and maintaining consistent progress.',
  },
];

export function EvaluationCriteriaSection() {
  return (
    <section className="border-t border-border bg-surface/30">
      <div className="container py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Evaluation</Eyebrow>
          <H2 className="mt-3">How You're Scored (100 Marks)</H2>
          <Text className="mt-3 text-muted-foreground">
            Teams are evaluated on a 100-mark rubric covering Project Evaluation (70), GitHub Activity (20), and Timeliness (10).
          </Text>
        </Reveal>

        <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {criteria.map((item) => (
            <StaggerItem key={item.title}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/20">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
