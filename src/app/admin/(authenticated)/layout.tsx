import type { ReactNode } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { requireAdminPageSession } from '@/lib/auth-guards';

export default async function AuthenticatedAdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPageSession();

  return <AdminShell>{children}</AdminShell>;
}
