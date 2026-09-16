import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  ListOrdered,
  ClipboardList,
  FolderKanban,
  ClipboardCheck,
  RefreshCw,
  Send,
  Activity,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export interface AdminNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.ADMIN_REGISTRATIONS, label: 'Registrations', icon: ClipboardCheck },
  { href: ROUTES.ADMIN_TEAMS, label: 'Teams', icon: Users },
  { href: ROUTES.ADMIN_PROJECTS, label: 'Projects', icon: FolderKanban },
  { href: ROUTES.ADMIN_EVALUATIONS, label: 'Evaluations', icon: ListOrdered },
  { href: ROUTES.ADMIN_SUBMISSIONS, label: 'Submissions', icon: Send },
  { href: ROUTES.ADMIN_GITHUB_ACTIVITY, label: 'GitHub Activity', icon: Activity },
  { href: ROUTES.ADMIN_GITHUB_SYNC, label: 'GitHub Sync', icon: RefreshCw },
  { href: ROUTES.ADMIN_AUDIT_LOGS, label: 'Audit Logs', icon: ClipboardList },
];
