import { FileSignature, CheckCircle, Code, ListChecks, Trophy, Star } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/components/shared/motion';
import { Eyebrow, H2, Text } from '@/components/shared/typography';

const steps = [
  { icon: FileSignature, title: 'Registration' },
  { icon: CheckCircle, title: 'Approval' },
  { icon: Code, title: 'Project Dev' },
  { icon: ListChecks, title: 'Evaluation' },
  { icon: Trophy, title: 'Leaderboard' },
  { icon: Star, title: 'Champion' },
];

export function CompetitionFlowSection() {
  return (
    <section className="overflow-hidden border-t border-border">
      <div className="container py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Flow</Eyebrow>
          <H2 className="mt-3">The CodeSprint Journey</H2>
        </Reveal>

        <Stagger className="relative mt-16 flex flex-wrap justify-center gap-4 sm:gap-6">
          {steps.map((step, index) => (
            <StaggerItem key={step.title} className="flex items-center gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-transform hover:scale-105">
                  <step.icon className="size-8 text-primary" />
                </div>
                <Text className="text-sm font-medium">{step.title}</Text>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden h-px w-8 bg-border sm:block md:w-12" />
              )}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
