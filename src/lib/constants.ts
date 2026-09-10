/**
 * Central place for values that would otherwise be "magic" and hardcoded
 * throughout the app. Business logic (tie-breaking, validation limits)
 * reads from here so a rule only ever has to change in one place.
 */

export const APP_NAME = 'Labyrinth CodeSprint Leaderboard' as const;
export const ORG_NAME = 'Labyrinth Computer Science Club' as const;
export const EVENT_NAME = 'CodeSprint 2026';

/** Slug of the event currently being displayed publicly. */
export const ACTIVE_EVENT_SLUG = process.env.NEXT_PUBLIC_ACTIVE_EVENT_SLUG ?? 'codesprint-26';

/** Number of evaluation checkpoints for CodeSprint (Phase 1 default). */
export const CHECKPOINT_COUNT = 2;

/**
 * Tie-break precedence, highest priority first: compare Checkpoint 2,
 * then 1. If every checkpoint is tied, the earlier-created
 * team wins.
 */
export const TIE_BREAK_CHECKPOINT_ORDER = [2, 1] as const;

export const SCORE_LIMITS = {
  MIN: 0,
  MAX: 1000,
} as const;

/** Pagination only kicks in above this many teams ("Pagination only if necessary"). */
export const LEADERBOARD_PAGE_SIZE = 20;

export const TOP_RANKS = {
  GOLD: 1,
  SILVER: 2,
  BRONZE: 3,
} as const;

export const AUTH = {
  SESSION_MAX_AGE_SECONDS: 60 * 60 * 8, // 8 hours
  REMEMBER_ME_MAX_AGE_SECONDS: 60 * 60 * 24 * 30, // 30 days
} as const;

/**
 * Placeholder event start date for the homepage countdown. This is a
 * *placeholder* per the brief — organizers should override
 * NEXT_PUBLIC_EVENT_START_DATE with the real CodeSprint start date/time
 * (ISO 8601, e.g. "2026-09-12T09:00:00+05:30") without touching code.
 */
export const EVENT_START_DATE_ISO =
  process.env.NEXT_PUBLIC_EVENT_START_DATE ?? '2026-09-11T09:00:00+05:30';

/**
 * Centralized schedule for CodeSprint.
 * The source of truth for submission windows and UI countdowns.
 */
export const EVENT_SCHEDULE = {
  START: EVENT_START_DATE_ISO,
  WEEK_1_DEADLINE: process.env.NEXT_PUBLIC_WEEK_1_DEADLINE ?? '2026-09-18T23:59:59+05:30',
  WEEK_2_DEADLINE: process.env.NEXT_PUBLIC_WEEK_2_DEADLINE ?? '2026-09-25T23:59:59+05:30',
} as const;

export const ROUTES = {
  HOME: '/',
  LEADERBOARD: '/leaderboard',
  REGISTER: '/register',
  TEAMS: '/teams',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_EVENTS: '/admin/events',
  ADMIN_TEAMS: '/admin/teams',
  ADMIN_SCORES: '/admin/scores',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_REGISTRATIONS: '/admin/registrations',
  ADMIN_EVALUATIONS: '/admin/evaluations',
  ADMIN_SUBMISSIONS: '/admin/submissions',
  ADMIN_GITHUB_SYNC: '/admin/github-sync',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  PARTICIPANT_LOGIN: '/login',
  ETHICS: '/ethics',
  DASHBOARD: '/dashboard',
  SUBMISSIONS: '/submissions',
} as const;

export const ETHICS_VERSION = process.env.NEXT_PUBLIC_ETHICS_VERSION ?? '2026-01';
