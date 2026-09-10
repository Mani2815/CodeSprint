import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Logo priority />

        <nav className="hidden items-center gap-6 sm:flex lg:gap-8">
          {[
            { label: 'Home', href: ROUTES.HOME },
            { label: 'Leaderboard', href: ROUTES.LEADERBOARD },
            { label: 'Teams', href: ROUTES.TEAMS },
            { label: 'Rewards', href: '/#rewards' },
            { label: 'FAQ', href: '/#faq' },
            { label: 'Contact', href: '/#contact' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild variant="secondary" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={ROUTES.REGISTER}>Register Team</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
