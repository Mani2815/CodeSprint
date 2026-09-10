'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
export function SubmissionRefreshButton({ submissionId }: { submissionId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  async function refresh() {
    setLoading(true);
    await fetch(`/api/admin/submissions/${submissionId}`, { method: 'POST' });
    setLoading(false);
    router.refresh();
  }
  return (
    <Button variant="secondary" onClick={refresh} disabled={loading}>
      {loading ? 'Refreshing…' : 'Refresh GitHub analysis'}
    </Button>
  );
}
