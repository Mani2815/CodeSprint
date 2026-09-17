import { describe, it, expect } from 'vitest';
import { calculateSuggestedGithubScore, SubmissionAnalyticsSnapshot } from '../github-sync-service';

describe('calculateSuggestedGithubScore', () => {
  const createSnapshot = (
    overrides: Partial<SubmissionAnalyticsSnapshot>
  ): SubmissionAnalyticsSnapshot => ({
    verificationStatus: 'VERIFIED',
    totalCommits: 0,
    pullRequestCount: 0,
    activeDays: 0,
    lastCommitAt: new Date(),
    repositoryHealth: 'Healthy',
    contributors: [],
    memberMetrics: [],
    ...overrides,
  });

  it('Case A: 0 activity should return 0 points', () => {
    const snapshot = createSnapshot({
      totalCommits: 0,
      pullRequestCount: 0,
      activeDays: 0,
      memberMetrics: [],
    });
    expect(calculateSuggestedGithubScore(snapshot)).toBe(0);
  });

  it('Case B: 1 commit, 0 PRs, 1 active day should return a small score (2 points)', () => {
    const snapshot = createSnapshot({
      totalCommits: 1,
      pullRequestCount: 0,
      activeDays: 1,
      memberMetrics: [{ contributionPercentage: 100 }],
    });
    // 1 (commits) + 0 (PRs) + 1 (active days) + 0 (balance, totalCommits < 5) = 2
    expect(calculateSuggestedGithubScore(snapshot)).toBe(2);
  });

  it('Case C: 3 commits, 0 PRs, 1 active day, 2 contributors', () => {
    const snapshot = createSnapshot({
      totalCommits: 3,
      pullRequestCount: 0,
      activeDays: 1,
      memberMetrics: [{ contributionPercentage: 50 }, { contributionPercentage: 50 }],
    });
    // 1 (commits) + 0 (PRs) + 1 (active days) + 0 (balance, totalCommits < 5) = 2
    expect(calculateSuggestedGithubScore(snapshot)).toBe(2);
  });

  it('Case D: 10 commits, 2 PRs, 3 active days, 2 contributors', () => {
    const snapshot = createSnapshot({
      totalCommits: 10,
      pullRequestCount: 2,
      activeDays: 3,
      memberMetrics: [{ contributionPercentage: 60 }, { contributionPercentage: 40 }],
    });
    // 3 (commits) + 5 (PRs) + 3 (active days) + 5 (balance diff 10%) = 16
    expect(calculateSuggestedGithubScore(snapshot)).toBe(16);
  });

  it('Case E: 30 commits, 10 PRs, 7 active days, 2 contributors (near upper range)', () => {
    const snapshot = createSnapshot({
      totalCommits: 30,
      pullRequestCount: 10,
      activeDays: 7,
      memberMetrics: [{ contributionPercentage: 51 }, { contributionPercentage: 49 }],
    });
    // 5 (commits) + 5 (PRs) + 5 (active days) + 5 (balance) = 20
    expect(calculateSuggestedGithubScore(snapshot)).toBe(20);
  });

  it('Case F: 100 commits in 1 day (should not artificially inflate beyond caps)', () => {
    const snapshot = createSnapshot({
      totalCommits: 100,
      pullRequestCount: 0,
      activeDays: 1,
      memberMetrics: [{ contributionPercentage: 100 }],
    });
    // 5 (commits) + 0 (PRs) + 1 (active days) + 5 (balance, solo) = 11
    expect(calculateSuggestedGithubScore(snapshot)).toBe(11);
  });

  it('rewards solo teams automatically for balance if threshold is met', () => {
    const snapshot = createSnapshot({
      totalCommits: 5,
      pullRequestCount: 0,
      activeDays: 1,
      memberMetrics: [{ contributionPercentage: 100 }],
    });
    // 3 (commits) + 0 (PRs) + 1 (active days) + 5 (balance) = 9
    expect(calculateSuggestedGithubScore(snapshot)).toBe(9);
  });
});
