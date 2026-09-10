# GitHub Integration & Cron Job Guide

This document details the configuration of the GitHub data synchronization pipeline.

## 1. GitHub Integration Guide

The application uses two distinct GitHub integrations: OAuth for Participant Logins, and a Personal Access Token (PAT) for background data fetching.

### Setting up Participant OAuth
1. Go to your GitHub account settings -> **Developer settings** -> **OAuth Apps** -> **New OAuth App**.
2. **Homepage URL**: `https://<your-domain>.com`
3. **Authorization callback URL**: `https://<your-domain>.com/api/auth/callback/github`
4. Generate a new Client Secret.
5. Save the Client ID and Client Secret in your `.env` as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

### Setting up the Synchronization PAT
The background cron job requires a token to fetch commits and pull requests.
1. Go to **Developer settings** -> **Personal access tokens** -> **Fine-grained tokens**.
2. **Resource Owner**: Select the organization hosting the CodeSprint repositories (or your personal account).
3. **Repository access**: Select "Only select repositories" and choose the CodeSprint repos.
4. **Permissions**: Grant **Read-only** access to "Contents" and "Pull requests".
5. Save the generated token in your `.env` as `GITHUB_API_TOKEN`.

## 2. Cron Job Guide

The synchronization job runs automatically, relying on Vercel's Cron infrastructure.

### Vercel Configuration
The `vercel.json` file dictates the schedule:
```json
{
  "crons": [
    {
      "path": "/api/cron/github-sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```
This runs at 2:00 AM UTC daily.

### Security
The endpoint `/api/cron/github-sync` is protected. It rejects any request that does not include the HTTP header:
`Authorization: Bearer <CRON_SECRET>`

### Manual Trigger
To manually force a synchronization (e.g., right before final judging), you can use cURL or Postman:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://<your-domain>.com/api/cron/github-sync
```

### Understanding the Algorithm
The service (`src/services/github-sync-service.ts`) uses an optimized $O(R)$ algorithm:
1. Iterates through configured `GITHUB_REPOSITORIES`.
2. Fetches all commits and PRs for the repository via the GitHub REST API (`/repos/{owner}/{repo}/commits`), utilizing pagination and automatic retries.
3. Groups the fetched data by the developer's GitHub username in memory.
4. Maps the data to registered Participants in the database.
5. Upserts the activity counts into the `GithubActivity` table.
