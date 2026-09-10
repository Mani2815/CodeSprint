import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/shared/logo';
import { LoginForm } from '@/features/auth/components/login-form';
import { ROUTES } from '@/lib/constants';

export const metadata = {
  title: 'Admin Login',
};

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user.role === 'admin') {
    redirect(ROUTES.ADMIN_DASHBOARD);
  }

  if (session?.user.role === 'participant') {
    redirect(ROUTES.DASHBOARD);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo href={false} imageClassName="h-9" />
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Organizer Access</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage teams and scores.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin Login</CardTitle>
            <CardDescription>Restricted to Labyrinth organizers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
