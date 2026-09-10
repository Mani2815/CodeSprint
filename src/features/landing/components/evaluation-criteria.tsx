import { Lightbulb, Code2, Layout, Linkedin, BookOpen, Users } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/shared/motion';
import { Eyebrow, H2, Text } from '@/components/shared/typography';

const criteria = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Originality and creativity of the solution.',
  },
  {
    icon: Code2,
    title: 'Technical Implementation',
    description: 'Code quality, architecture, and complexity.',
  },
  { icon: Layout, title: 'UI/UX', description: 'Design, usability, and user experience.' },
  {
    icon: Linkedin,
    title: 'LinkedIn Post',
    description: 'Post your project on LinkedIn and mention CUCS & Labyrinth.',
  },
  { icon: BookOpen, title: 'Documentation', description: 'README quality and code documentation.' },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Effective distribution of work and Git usage.',
  },
];

export function EvaluationCriteriaSection() {
  return (
    <section className="border-t border-border bg-surface/30">
      <div className="container py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Evaluation</Eyebrow>
          <H2 className="mt-3">How You're Scored</H2>
          <Text className="mt-3 text-muted-foreground">
            Teams are evaluated weekly by a panel of faculty members across six key dimensions.
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
