import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/api-auth';
import { syncGithubActivity } from '@/services/github-sync-service';
import { logAdminAction } from '@/services/audit-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const summary = await syncGithubActivity();
    await logAdminAction(
      session.user.id,
      'MANUAL_GITHUB_SYNC',
      'GitHubSync',
      undefined,
      null,
      summary
    );
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GitHub sync failed.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
