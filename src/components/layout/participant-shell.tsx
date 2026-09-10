import Link from 'next/link';
import { Github, LayoutDashboard, Send, Trophy } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { ParticipantLogoutButton } from '@/features/auth/components/participant-logout-button';
import { ROUTES } from '@/lib/constants';

export function ParticipantShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Logo href={ROUTES.DASHBOARD} priority />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-surface hover:text-foreground sm:flex"
              href={ROUTES.LEADERBOARD}
            >
              <Trophy className="size-4" /> Leaderboard
            </Link>
            <Link
              className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
              href={ROUTES.DASHBOARD}
            >
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
            <Link
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-surface hover:text-foreground sm:flex"
              href={ROUTES.SUBMISSIONS}
            >
              <Send className="size-4" /> Submissions
            </Link>
            <ParticipantLogoutButton />
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border/80 px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-muted-foreground">
          <span>CodeSprint participant portal</span>
          <span className="inline-flex items-center gap-1.5">
            <Github className="size-3.5" /> GitHub connected
          </span>
        </div>
      </footer>
    </div>
  );
}
