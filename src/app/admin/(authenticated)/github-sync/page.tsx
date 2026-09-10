import { H1, Muted } from '@/components/shared/typography';
import { ManualSyncButton } from '@/features/dashboard/components/manual-sync-button';

export const metadata = {
  title: 'GitHub Sync | Admin Dashboard',
};

export default function GitHubSyncPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <H1 className="text-3xl font-bold tracking-tight">GitHub Sync</H1>
        <Muted className="mt-2">
          Trigger a repository statistics synchronization for the active event.
        </Muted>
      </div>

      <ManualSyncButton />
    </div>
  );
}
