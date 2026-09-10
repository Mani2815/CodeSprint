'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/logo';
import { ROUTES } from '@/lib/constants';
import { ParticipantLogoutButton } from '@/features/auth/components/participant-logout-button';
import {
  LayoutDashboard,
  Send,
  History,
  Github,
  Trophy,
  Users,
  Megaphone,
  User,
  Bell,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Participant, Team } from '@prisma/client';

interface ParticipantDashboardShellProps {
  children: React.ReactNode;
  participant: Participant & { team?: Team | null };
  currentWeek: string;
  overallScore: number;
  unreadNotifications: number;
}

const SIDEBAR_LINKS = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Weekly Submission', href: '/dashboard/submission', icon: Send },
  { name: 'Submission History', href: '/dashboard/history', icon: History },
  { name: 'GitHub Analytics', href: '/dashboard/github', icon: Github },
  { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
];

export function ParticipantDashboardShell({
  children,
  participant,
  currentWeek,
  overallScore,
  unreadNotifications,
}: ParticipantDashboardShellProps) {
  const pathname = usePathname();
  const currentPathname = pathname ?? '';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Logo href={ROUTES.DASHBOARD} />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {SIDEBAR_LINKS.map((link) => {
          const isActive =
            currentPathname === link.href ||
            (link.href !== ROUTES.DASHBOARD && currentPathname.startsWith(link.href));
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground'
              )}
            >
              <link.icon
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/50 p-4">
        <ParticipantLogoutButton />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 w-64 border-r border-border/80 bg-background shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border/80 lg:bg-surface/30">
        {sidebarContent}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Logo href={ROUTES.DASHBOARD} className="lg:hidden" />
          </div>

          <div className="hidden items-center gap-6 lg:flex">
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {participant.team?.name ?? 'No Team Assigned'}
              </span>
              <span className="text-xs text-muted-foreground">Team</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{currentWeek}</span>
              <span className="text-xs text-muted-foreground">Current Phase</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-primary">{overallScore} Points</span>
              <span className="text-xs text-muted-foreground">Overall Score</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/announcements"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadNotifications}
                </span>
              )}
            </Link>

            <div className="ml-2 flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-none">
                  {participant.name || participant.githubUsername}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">@{participant.githubUsername}</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={participant.avatarUrl ?? undefined} />
                <AvatarFallback>
                  {(participant.name || participant.githubUsername).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
