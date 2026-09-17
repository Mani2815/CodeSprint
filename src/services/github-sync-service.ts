import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export class InvalidRepositoryUrlError extends Error {
  constructor() {
    super('Enter a valid GitHub repository URL.');
    this.name = 'InvalidRepositoryUrlError';
  }
}
export class RepositoryUnavailableError extends Error {
  constructor() {
    super('This repository does not exist or is not accessible.');
    this.name = 'RepositoryUnavailableError';
  }
}
export class GithubUserNotFoundError extends Error {
  constructor() {
    super('GitHub user not found. Please check the username.');
    this.name = 'GithubUserNotFoundError';
  }
}

type RepositoryRef = { owner: string; name: string; url: string };
type Commit = {
  sha: string;
  author?: { login?: string | null } | null;
  commit?: { author?: { date?: string | null } | null } | null;
};
type PullRequest = {
  user?: { login?: string | null } | null;
  created_at?: string;
  updated_at?: string;
};
type Contributor = { login?: string | null; contributions?: number | null };
type Repository = {
  default_branch?: string | null;
  archived?: boolean;
  disabled?: boolean;
  open_issues_count?: number;
  pushed_at?: string | null;
};
type GithubProfile = {
  login: string;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  html_url: string;
};

export type SubmissionAnalyticsSnapshot = {
  verificationStatus: 'VERIFIED' | 'VERIFICATION_REQUIRED';
  totalCommits: number;
  pullRequestCount: number;
  activeDays: number;
  lastCommitAt: Date | null;
  repositoryHealth: string;
  contributors: Prisma.InputJsonValue;
  memberMetrics: Prisma.InputJsonValue;
};

export function parseGithubRepositoryUrl(value: string): RepositoryRef {
  const normalized = value
    .trim()
    .replace(/\.git$/, '')
    .replace(/\/$/, '');
  const match = normalized.match(/^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)$/i);
  if (!match?.[1] || !match[2]) throw new InvalidRepositoryUrlError();
  return { owner: match[1], name: match[2], url: `https://github.com/${match[1]}/${match[2]}` };
}

function headers(token?: string) {
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'CodeSprint-Leaderboard',
  };
}
/** Lightweight registration check; it does not inspect any repositories or activity. */
export async function verifyGithubUsername(username: string) {
  const normalized = username.trim().replace(/^@/, '');
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(normalized)) {
    throw new GithubUserNotFoundError();
  }
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(normalized)}`, {
    headers: headers(),
    next: { revalidate: 0 },
  });
  if (response.status === 404) throw new GithubUserNotFoundError();
  if (!response.ok) throw new Error(`GitHub profile lookup failed with ${response.status}.`);
  const profile = (await response.json()) as GithubProfile;
  return {
    username: profile.login,
    displayName: profile.name ?? profile.login,
    avatarUrl: profile.avatar_url,
    publicRepositoryCount: profile.public_repos,
    profileUrl: profile.html_url,
  };
}
async function request<T>(url: string, token?: string): Promise<{ data: T; next: string | null }> {
  const response = await fetch(url, { headers: headers(token), next: { revalidate: 0 } });
  if (response.status === 404 || response.status === 401 || response.status === 403)
    throw new RepositoryUnavailableError();
  if (!response.ok) throw new Error(`GitHub API request failed with ${response.status}.`);
  const next = response.headers.get('link')?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
  return { data: (await response.json()) as T, next };
}
async function paginate<T>(url: string, token?: string): Promise<T[]> {
  const results: T[] = [];
  let next: string | null = url;
  while (next) {
    const page: { data: T[]; next: string | null } = await request<T[]>(next, token);
    results.push(...page.data);
    next = page.next;
  }
  return results;
}

/** Fetches and filters a repository analysis to registered team members only. */
export async function analyzeSubmittedRepository(
  repositoryUrl: string,
  usernames: string[],
  startDate?: Date,
  endDate?: Date
): Promise<SubmissionAnalyticsSnapshot> {
  const repository = parseGithubRepositoryUrl(repositoryUrl);
  const token = process.env.GITHUB_API_TOKEN;
  const base = `https://api.github.com/repos/${repository.owner}/${repository.name}`;
  let commitsUrl = `${base}/commits?per_page=100`;
  if (startDate) commitsUrl += `&since=${startDate.toISOString()}`;
  if (endDate) commitsUrl += `&until=${endDate.toISOString()}`;

  const [metadata, commits, pullRequests, contributors] = await Promise.all([
    request<Repository>(base, token),
    paginate<Commit>(commitsUrl, token),
    paginate<PullRequest>(`${base}/pulls?state=all&per_page=100`, token),
    paginate<Contributor>(`${base}/contributors?per_page=100`, token),
  ]);
  const registered = new Set(usernames.map((name) => name.toLowerCase()));
  const metrics = new Map(
    usernames.map((name) => [
      name.toLowerCase(),
      {
        username: name,
        commits: 0,
        pullRequests: 0,
        activeDays: new Set<string>(),
        lastCommitAt: null as Date | null,
      },
    ])
  );

  const commitHistory: Array<{ sha: string; author: string; timestamp: string }> = [];

  for (const commit of commits) {
    const login = commit.author?.login?.toLowerCase() || 'unknown';
    const metric = login ? metrics.get(login) : undefined;
    const date = commit.commit?.author?.date ? new Date(commit.commit.author.date) : null;

    if (date && !Number.isNaN(date.valueOf())) {
      if (metric) {
        metric.commits += 1;
        metric.activeDays.add(date.toISOString().slice(0, 10));
        if (!metric.lastCommitAt || date > metric.lastCommitAt) metric.lastCommitAt = date;
      }

      commitHistory.push({
        sha: commit.sha,
        author: login,
        timestamp: date.toISOString(),
      });
    }
  }
  for (const pullRequest of pullRequests) {
    if (startDate || endDate) {
      const prDateString = pullRequest.created_at || pullRequest.updated_at;
      if (prDateString) {
        const prDate = new Date(prDateString);
        if (startDate && prDate < startDate) continue;
        if (endDate && prDate > endDate) continue;
      }
    }
    const login = pullRequest.user?.login?.toLowerCase();
    const metric = login ? metrics.get(login) : undefined;
    if (metric) metric.pullRequests += 1;
  }
  const members = [...metrics.values()];
  const totalCommits = members.reduce((sum, member) => sum + member.commits, 0);
  const allDates = new Set(members.flatMap((member) => [...member.activeDays]));
  const lastCommitAt = members.reduce<Date | null>(
    (latest, member) =>
      !latest || (member.lastCommitAt && member.lastCommitAt > latest)
        ? member.lastCommitAt
        : latest,
    null
  );
  const memberMetricsArray = members.map((member) => ({
    username: member.username,
    commits: member.commits,
    pullRequests: member.pullRequests,
    activeDays: member.activeDays.size,
    contributionPercentage: totalCommits
      ? Number(((member.commits / totalCommits) * 100).toFixed(2))
      : 0,
    lastCommitAt: member.lastCommitAt?.toISOString() ?? null,
  }));
  const memberMetrics = {
    members: memberMetricsArray,
    commits: commitHistory,
  };
  const repositoryContributors = contributors.map((contributor) => ({
    username: contributor.login ?? 'unknown',
    contributions: contributor.contributions ?? 0,
    registered: contributor.login ? registered.has(contributor.login.toLowerCase()) : false,
  }));
  const health =
    metadata.data.archived || metadata.data.disabled
      ? 'Unavailable'
      : !metadata.data.default_branch
        ? 'Needs attention'
        : metadata.data.pushed_at
          ? 'Healthy'
          : 'No recent activity';
  return {
    verificationStatus: totalCommits > 0 ? 'VERIFIED' : 'VERIFICATION_REQUIRED',
    totalCommits,
    pullRequestCount: members.reduce((sum, member) => sum + member.pullRequests, 0),
    activeDays: allDates.size,
    lastCommitAt,
    repositoryHealth: health,
    contributors: repositoryContributors,
    memberMetrics,
  };
}

/** Re-verifies existing submissions; each snapshot remains scoped to its own week. */
export async function syncGithubActivity(submissionId?: string) {
  const submissions = await prisma.weeklySubmission.findMany({
    where: submissionId ? { id: submissionId } : {},
    include: {
      team: { include: { participants: { select: { githubUsername: true } } } },
      checkpoint: true,
    },
  });

  let synced = 0;
  let failed = 0;
  for (const submission of submissions) {
    try {
      const snapshot = await analyzeSubmittedRepository(
        submission.repositoryUrl,
        submission.team.participants.map((member) => member.githubUsername),
        submission.checkpoint.startDate || undefined,
        submission.checkpoint.endDate || submission.checkpoint.submissionCloseDate || undefined
      );
      await prisma.$transaction([
        prisma.submissionAnalytics.upsert({
          where: { submissionId: submission.id },
          create: {
            submissionId: submission.id,
            totalCommits: snapshot.totalCommits,
            pullRequestCount: snapshot.pullRequestCount,
            activeDays: snapshot.activeDays,
            lastCommitAt: snapshot.lastCommitAt,
            repositoryHealth: snapshot.repositoryHealth,
            contributors: snapshot.contributors,
            memberMetrics: snapshot.memberMetrics,
          },
          update: {
            totalCommits: snapshot.totalCommits,
            pullRequestCount: snapshot.pullRequestCount,
            activeDays: snapshot.activeDays,
            lastCommitAt: snapshot.lastCommitAt,
            repositoryHealth: snapshot.repositoryHealth,
            contributors: snapshot.contributors,
            memberMetrics: snapshot.memberMetrics,
            syncedAt: new Date(),
          },
        }),
        prisma.weeklySubmission.update({
          where: { id: submission.id },
          data: { verificationStatus: snapshot.verificationStatus },
        }),
      ]);
      synced += 1;
    } catch (error) {
      console.error(`[GitHub Sync Error] Failed to analyze submission ${submission.id}:`, error);
      await prisma.weeklySubmission.update({
        where: { id: submission.id },
        data: { verificationStatus: 'ANALYSIS_FAILED' },
      });
      failed += 1;
    }
  }
  return { submissions: submissions.length, synced, failed, syncedAt: new Date().toISOString() };
}

export function calculateSuggestedGithubScore(analytics: SubmissionAnalyticsSnapshot): number {
  let score = 0;

  // 1. Commit Volume (max 5)
  if (analytics.totalCommits >= 15) score += 5;
  else if (analytics.totalCommits >= 5) score += 3;
  else if (analytics.totalCommits >= 1) score += 1;

  // 2. Pull Request Usage (max 5)
  if (analytics.pullRequestCount >= 2) score += 5;
  else if (analytics.pullRequestCount === 1) score += 3;

  // 3. Active Days (max 5)
  if (analytics.activeDays >= 4) score += 5;
  else if (analytics.activeDays >= 2) score += 3;
  else if (analytics.activeDays === 1) score += 1;

  // 4. Team Contribution Balance (max 5)
  const rawMetrics = analytics.memberMetrics as Record<string, unknown> | null;
  const metrics = (Array.isArray(rawMetrics) ? rawMetrics : rawMetrics?.members || []) as Array<{
    contributionPercentage: number;
  }>;
  if (analytics.totalCommits >= 5 && metrics && metrics.length > 0) {
    const percentages = metrics.map((m) => m.contributionPercentage);
    const max = Math.max(...percentages);
    const min = Math.min(...percentages);
    const diff = max - min;

    if (metrics.length === 1) {
      score += 5; // Solo team is balanced by default
    } else if (diff <= 25) {
      score += 5; // Very balanced
    } else if (diff <= 50) {
      score += 3; // Moderately balanced
    } else {
      score += 1; // Highly skewed
    }
  }

  return score;
}
