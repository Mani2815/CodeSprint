import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { acceptEthics } from '@/services/participant-service';
import { ETHICS_VERSION, ROUTES } from '@/lib/constants';
import { Logo } from '@/components/shared/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { H1, Lead, Muted } from '@/components/shared/typography';
import { Check, HeartHandshake, ShieldCheck } from 'lucide-react';
import { AcceptEthicsButton } from './components/accept-button';

async function acceptAction() {
  'use server';
  const session = await getServerSession(authOptions);
  if (!session?.user.participantId || session.user.role !== 'participant')
    redirect(ROUTES.PARTICIPANT_LOGIN);
  await acceptEthics(session.user.participantId, ETHICS_VERSION);
  redirect(ROUTES.DASHBOARD);
}

export default async function EthicsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user.participantId || session.user.role !== 'participant')
    redirect(ROUTES.PARTICIPANT_LOGIN);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-5 py-8 sm:px-8">
      <div className="pointer-events-none absolute -right-40 top-20 size-[30rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-between gap-12">
        <Logo href={ROUTES.HOME} priority />
        <div className="mx-auto w-full max-w-2xl">
          <Badge variant="success">
            <ShieldCheck className="size-3.5" />
            One-time setup
          </Badge>
          <H1 className="mt-5">
            Build with <span className="text-primary">integrity.</span>
          </H1>
          <Lead className="mt-5">
            CodeSprint is a team challenge. A great sprint is competitive, generous, and honest at
            the same time.
          </Lead>
          <Card className="mt-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartHandshake className="size-5 text-primary" />
                Our shared standard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-7 text-muted-foreground">
                By continuing, you agree to participate responsibly, respect your teammates and
                other teams, and follow the challenge rules.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {['Credit your collaborators', 'Respect the rules', 'Ship your own work'].map(
                  (item) => (
                    <div
                      className="flex items-start gap-2 rounded-lg bg-surface/60 p-3 text-sm"
                      key={item}
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-success" />
                      {item}
                    </div>
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Agreement version {ETHICS_VERSION}. Your acceptance is recorded with your
                participant account.
              </p>
            </CardContent>
          </Card>
          <form action={acceptAction} className="mt-6">
            <AcceptEthicsButton />
          </form>
        </div>
        <Muted className="text-center">
          You can review the current agreement version from your participant dashboard.
        </Muted>
      </div>
    </main>
  );
}
