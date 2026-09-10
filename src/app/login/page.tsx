import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Logo } from '@/components/shared/logo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { H1, Lead, Muted } from '@/components/shared/typography';
import { Github, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { ParticipantLoginButton } from '@/features/auth/components/participant-login-button';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  github: 'GitHub login failed or was cancelled. Please try again.',
  not_approved:
    'Access denied. Your GitHub account is not associated with an approved CodeSprint registration.',
  AccessDenied: 'We could not complete your GitHub login. Please try again.',
  OAuthCallback: 'GitHub login was cancelled or failed. Please try again.',
  OAuthSignin: 'GitHub login was cancelled or failed. Please try again.',
  OAuthAccountNotLinked:
    'We could not link your GitHub account to an approved participant profile.',
  Callback: 'Authentication failed. Please try again.',
  CredentialsSignin: 'Invalid username or password.',
  SessionRequired: 'Your session expired. Please sign in again.',
  Default: 'Authentication failed. Please try again.',
};

export default async function UnifiedLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session?.user.role === 'participant') redirect('/dashboard');
  if (session?.user.role === 'admin') redirect('/admin/dashboard');

  const errorKey = typeof searchParams.error === 'string' ? searchParams.error : undefined;
  const errorMessage = errorKey
    ? (AUTH_ERROR_MESSAGES[errorKey] ?? AUTH_ERROR_MESSAGES.Default)
    : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-5 py-8 sm:px-8">
      <div className="pointer-events-none absolute -left-40 top-24 size-[32rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="bg-secondary/40 pointer-events-none absolute -right-40 bottom-0 size-[28rem] rounded-full blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col gap-16">
        <header>
          <Logo href={ROUTES.HOME} priority />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="mb-12 text-center">
            <Badge className="mb-4">
              <Zap className="mr-2 size-3.5" />
              Authentication Portal
            </Badge>
            <H1 className="max-w-2xl">
              Welcome to <span className="text-primary">CodeSprint</span>
            </H1>
            <Lead className="mx-auto mt-4 max-w-xl text-center">
              Select your role to access the platform.
            </Lead>

            {errorMessage && (
              <div className="bg-destructive/15 text-destructive border-destructive/20 mx-auto mt-6 max-w-md rounded-md border p-4 text-left text-sm font-medium">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="grid w-full max-w-4xl gap-6 sm:grid-cols-2 lg:gap-8">
            {/* Organizer Card */}
            <Card className="flex flex-col border-primary/20 bg-card/90 backdrop-blur transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="flex flex-1 flex-col p-7 sm:p-9">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <ShieldCheck className="size-6" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold">Organizer Login</h2>
                <Muted className="mt-2 flex-1">
                  Manage registrations, approvals, evaluations, projects, leaderboard,
                  announcements, and event administration.
                </Muted>
                <Button asChild className="group mt-8 w-full">
                  <Link href="/admin/login">
                    Continue as Organizer{' '}
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Participant Card */}
            <Card className="flex flex-col border-primary/20 bg-card/90 backdrop-blur transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="flex flex-1 flex-col p-7 sm:p-9">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Github className="size-6" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold">Participant Login</h2>
                <Muted className="mt-2 flex-1">
                  Access your team dashboard, submit weekly projects, view GitHub analytics, monitor
                  evaluations, leaderboard ranking, and announcements.
                </Muted>
                <ParticipantLoginButton />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/70 pt-5 text-xs text-muted-foreground">
          <span>Labyrinth Computer Science Club</span>
          <span>CodeSprint 2026</span>
        </div>
      </div>
    </main>
  );
}
