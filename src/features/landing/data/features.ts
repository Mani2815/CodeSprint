import type { LucideIcon } from 'lucide-react';
import { Trophy, RefreshCw, ShieldCheck, Gauge, Users, ListChecks } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: Trophy,
    title: 'Live Rankings',
    description:
      'Rankings recalculate automatically the moment organizers save checkpoint scores — no manual sorting.',
  },
  {
    icon: RefreshCw,
    title: 'Refresh to Update',
    description:
      'No accounts, no sockets, no flaky real-time sync. Participants simply refresh the page to see the latest standings.',
  },
  {
    icon: ShieldCheck,
    title: 'Organizer-Only Access',
    description:
      'Only Labyrinth organizers can sign in. Participants view a clean, read-only leaderboard — nothing to configure.',
  },
  {
    icon: Gauge,
    title: 'Checkpoint Scoring',
    description:
      'Four evaluation checkpoints per team, each tracked individually, with totals always computed — never entered by hand.',
  },
  {
    icon: Users,
    title: 'Simple Team Management',
    description: 'Add, edit, or remove teams in seconds, with built-in duplicate-name protection.',
  },
  {
    icon: ListChecks,
    title: 'Fair Tie-Breaking',
    description:
      'Ties resolve by later checkpoints first (4 → 3 → 2 → 1), then by which team registered earliest.',
  },
];
