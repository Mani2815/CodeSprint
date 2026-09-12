import Link from 'next/link';
import { ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/shared/motion';
import { Eyebrow, Lead } from '@/components/shared/typography';
import { Logo } from '@/components/shared/logo';
import Image from 'next/image';
import { ORG_NAME, ROUTES } from '@/lib/constants';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft radial glow behind the hero, on-brand but restrained */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[480px] w-[880px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]"
      />

      <div className="container relative flex flex-col items-center gap-8 pb-24 pt-12 text-center sm:pb-32 sm:pt-16">
        <Reveal>
          <Logo href={false} imageClassName="h-10 sm:h-12" />
        </Reveal>

        <Reveal delay={0.05}>
          <Eyebrow>{ORG_NAME}</Eyebrow>
        </Reveal>

        <Reveal delay={0.1} className="w-full max-w-4xl px-4 sm:px-8">
          <Image
            src="/codesprint-text.png"
            alt="CodeSprint 2026"
            width={800}
            height={200}
            className="h-auto w-full object-contain drop-shadow-md dark:invert"
          />
        </Reveal>

        <Reveal delay={0.15} className="max-w-2xl">
          <Lead>Build. Innovate. Compete.</Lead>
        </Reveal>

        <Reveal delay={0.2} className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          <p>
            CodeSprint is Labyrinth&apos;s premier 2-week software development competition. Teams of
            three create a brand-new project every week, receive faculty evaluations, and earn
            cumulative points to compete for the overall CodeSprint Championship.
          </p>
        </Reveal>

        <Reveal delay={0.3} className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={ROUTES.LEADERBOARD}>
              View Leaderboard
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href={ROUTES.REGISTER}>
              <UserPlus />
              Register Your Team
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
