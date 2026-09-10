'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Reveal } from '@/components/shared/motion';
import { Eyebrow, H2 } from '@/components/shared/typography';

const faqs = [
  {
    q: 'How many members can be in a team?',
    a: 'Each team must consist of exactly 2 members.',
  },
  {
    q: 'Can we change team members after registration?',
    a: 'Teams are formed by the organizers after individual participant registrations are collected. Each team will typically consist of 1 PG student and 2 UG students, with team formation also considering compatible skills and technology interests. Once your team has been finalized and registered on the portal, team members cannot be changed.',
  },
  {
    q: 'How is the evaluation done?',
    a: 'Faculty panels will evaluate your project every week across six dimensions: Innovation, Technical Implementation, UI/UX, LinkedIn Post, Documentation, and Team Collaboration.',
  },
  {
    q: 'Do we need a GitHub repository?',
    a: 'Yes, CodeSprint requires a public GitHub repository. Your weekly contributions and commits are tracked and factored into the Most Active Developer and Most Active Team awards.',
  },
  {
    q: 'Can we use any tech stack?',
    a: 'Yes! You are completely free to choose any framework, language, or technology stack that best fits your project idea.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border">
      <div className="container py-20 sm:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>FAQ</Eyebrow>
          <H2 className="mt-3">Frequently Asked Questions</H2>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-16 max-w-3xl space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-foreground">{faq.q}</span>
                  <div className="ml-4 flex shrink-0 items-center justify-center rounded-full bg-surface p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                    {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </div>
                </button>
                <div
                  className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
