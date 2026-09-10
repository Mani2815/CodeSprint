import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Eyebrow, H1, Lead } from '@/components/shared/typography';
import { ROUTES } from '@/lib/constants';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-primary">
          <Compass className="size-6" />
        </div>
        <Eyebrow>404</Eyebrow>
        <H1 className="text-4xl sm:text-5xl">Lost in the labyrinth</H1>
        <Lead className="max-w-md">
          The page you&apos;re looking for doesn&apos;t exist, or the link may be out of date.
        </Lead>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={ROUTES.HOME}>Back to Home</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={ROUTES.LEADERBOARD}>View Leaderboard</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
