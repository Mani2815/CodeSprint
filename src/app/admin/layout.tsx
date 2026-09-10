import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/components/auth-provider';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
