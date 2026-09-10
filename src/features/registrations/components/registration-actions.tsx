'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
export function RegistrationActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  if (status !== 'PENDING') return <span className="text-sm font-medium">{status}</span>;
  async function action(type: 'approve' | 'reject') {
    const reason = type === 'reject' ? window.prompt('Rejection reason:') : null;
    if (type === 'reject' && !reason) return;
    const res = await fetch(`/api/registrations/${id}/${type}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: type === 'reject' ? JSON.stringify({ reason }) : undefined,
    });
    if (!res.ok) window.alert((await res.json()).error ?? 'Action failed');
    else router.refresh();
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => action('approve')}>
        Approve
      </Button>
      <Button size="sm" variant="secondary" onClick={() => action('reject')}>
        Reject
      </Button>
    </div>
  );
}
