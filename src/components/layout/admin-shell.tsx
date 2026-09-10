import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 pb-20 sm:pb-0">
        <div className="container max-w-6xl py-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
