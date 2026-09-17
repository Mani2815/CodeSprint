import { Reveal, Stagger, StaggerItem } from '@/components/shared/motion';
import { Eyebrow, H2, H4, Muted, Text } from '@/components/shared/typography';
import { TIMELINE_STEPS } from '@/features/landing/data/timeline';
import { Calendar } from 'lucide-react';

export function TimelineSection() {
  return (
    <section id="schedule" className="border-t border-border bg-surface/10">
      <div className="container py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>Schedule</Eyebrow>
          <H2 className="mt-3">2 Weeks of Intense Development</H2>
          <Muted className="mt-3">A structured timeline designed to push your limits.</Muted>
        </Reveal>

        <Stagger className="relative mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {TIMELINE_STEPS.map((step, index) => (
            <StaggerItem key={step.label} className="relative z-10 flex flex-col">
              {/* Connector line to the next dot */}
              {index < TIMELINE_STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="absolute left-[3rem] right-[-1.5rem] top-6 -z-10 hidden h-px bg-border/80 md:block"
                />
              )}
              <div className="mb-6 flex size-12 shrink-0 items-center justify-center self-center rounded-full border-[4px] border-background bg-primary text-primary-foreground shadow-sm md:self-start">
                <Calendar className="size-5" />
              </div>
              <div className="flex flex-1 flex-col rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <Eyebrow className="text-primary">{step.label}</Eyebrow>
                <H4 className="mt-2 text-lg">{step.title}</H4>
                <Text className="mt-2 text-sm text-muted-foreground">{step.description}</Text>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
