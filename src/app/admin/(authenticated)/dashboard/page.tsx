import { Suspense } from 'react';
import Link from 'next/link';
import { Users, ListOrdered, Github } from 'lucide-react';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardStats } from '@/features/dashboard/components/dashboard-stats';
import { DashboardStatsSkeleton } from '@/features/dashboard/components/dashboard-stats-skeleton';
import { ManualSyncButton } from '@/features/dashboard/components/manual-sync-button';
import { ROUTES } from '@/lib/constants';

export const metadata = {
  title: 'Dashboard',
};

// Stats depend on live DB data (team/score counts) — always fetch fresh
// rather than letting Next.js statically cache this route.
export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <H1 className="text-3xl sm:text-4xl">Dashboard</H1>
        <Muted className="mt-1">Overview of the current CodeSprint standings.</Muted>
      </div>

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Users className="size-5" />
            </div>
            <CardTitle className="mt-2">Manage Teams</CardTitle>
            <CardDescription>Add, rename, or remove participating teams.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href={ROUTES.ADMIN_TEAMS}>Go to Teams</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ListOrdered className="size-5" />
            </div>
            <CardTitle className="mt-2">Enter Scores</CardTitle>
            <CardDescription>Update checkpoint scores and publish new rankings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link href={ROUTES.ADMIN_SCORES}>Go to Scores</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Github className="size-5" />
            </div>
            <CardTitle className="mt-2">GitHub Sync</CardTitle>
            <CardDescription>
              Manually trigger a repository statistics synchronization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManualSyncButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
