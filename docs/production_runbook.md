# Production Deployment Runbook

This document is the definitive guide for DevOps, Release Engineers, and QA Leads responsible for deploying the Labyrinth CodeSprint Leaderboard to production.

## 1. Production Deployment Guide (Vercel)

The application relies on Next.js Serverless architecture and is best suited for Vercel.

### Vercel Deployment Steps
1. Navigate to the Vercel Dashboard and click **Add New...** > **Project**.
2. Import the GitHub repository for this project.
3. **Framework Preset**: Next.js
4. **Root Directory**: `./` (Default)
5. **Build Command**: `npm run build` (This automatically runs `prisma generate` before `next build`).
6. **Install Command**: `npm install`
7. **Environment Variables**: Add all variables defined in Section 2.
8. Click **Deploy**.

## 2. Environment Variable Reference

Ensure the following variables are strictly configured in the Vercel Production Environment:

| Variable | Description | Security |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (must include `?sslmode=require`). | **CRITICAL SECRET** |
| `NEXTAUTH_SECRET` | 32-byte string used to encrypt JWTs. Generate with `openssl rand -base64 32`. | **CRITICAL SECRET** |
| `NEXTAUTH_URL` | The production URL (e.g., `https://codesprint.app`). | Public |
| `NEXT_PUBLIC_ACTIVE_EVENT_SLUG` | Used by the UI and Cron to find the active event (e.g., `codesprint-2026`). | Public |
| `NEXT_PUBLIC_EVENT_START_DATE` | ISO 8601 timestamp for the frontend countdown. | Public |
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID. | Public |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret. | **CRITICAL SECRET** |
| `GITHUB_API_TOKEN` | Fine-grained PAT for background sync. Must have *Read-Only* access to public repos. | **CRITICAL SECRET** |
| `GITHUB_REPOSITORIES` | Comma-separated list of repository URLs (e.g., `user/repo1,user/repo2`). | Public |
| `GITHUB_SYNC_CHECKPOINT_ORDER` | The checkpoint order receiving the current GitHub activity (default `1`). | Public |
| `GITHUB_SPRINT_START_ISO` | ISO timestamp filtering commits/PRs during sync. | Public |
| `CRON_SECRET` | Secure bearer token to protect `/api/cron/github-sync`. | **CRITICAL SECRET** |

## 3. Database Initialization Guide

The application uses Prisma and requires manual seeding for baseline data.

### Steps to Initialize
1. Connect to your database locally using the production `DATABASE_URL` or use Vercel CLI.
2. Run database push to synchronize the schema:
   ```bash
   npx prisma db push
   ```
3. Run the seed script to create the Event and Checkpoints:
   ```bash
   npx prisma db seed
   ```
   *Note: Without running the seed, the Cron Job and Admin Dashboard will fail.*

## 4. GitHub OAuth Setup Guide

To enable Participant Login:
1. Go to GitHub -> Settings -> Developer Settings -> OAuth Apps -> **New OAuth App**.
2. **Homepage URL**: `https://<your-production-domain>.com`
3. **Authorization callback URL**: `https://<your-production-domain>.com/api/auth/callback/github`
4. Generate the `Client Secret`.
5. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to Vercel.

## 5. Cron Configuration Guide

The GitHub synchronization is automated via Vercel Cron.
- **Schedule**: Defined in `vercel.json` (`0 2 * * *` = 2:00 AM UTC daily).
- **Protection**: The cron endpoint requires the `CRON_SECRET`.
- **Vercel Setup**: Navigate to your Vercel Project -> **Settings** -> **Cron Jobs**. Vercel will automatically read `vercel.json` and sync the `CRON_SECRET` from your environment variables to the authorization header.

## 6. Production Readiness Checklist

- [ ] All environment variables are set in Vercel.
- [ ] Vercel deployment succeeded without warnings.
- [ ] `DATABASE_URL` is pointing to the production Neon PostgreSQL instance.
- [ ] `npm run db:push` and `npm run db:seed` were successfully executed on the production DB.
- [ ] `NEXTAUTH_SECRET` and `CRON_SECRET` are securely generated and applied.
- [ ] Admin account created via `scripts/create-admin.ts`.
- [ ] GitHub OAuth App is configured with the production callback URL.
- [ ] GitHub API Token (Fine-grained PAT) is valid and injected.

## 7. Rollback Plan

If a deployment introduces a critical regression during the event:
1. **Instant Vercel Rollback**: 
   - Go to Vercel Dashboard -> Project -> **Deployments**.
   - Find the last known stable deployment.
   - Click the three dots (`...`) -> **Promote to Production** (or **Assign Custom Domain** depending on Vercel tier).
2. **Database Rollback (If Schema Changed)**:
   - If the broken deployment included a Prisma migration that destroyed data, utilize the Neon.tech **Point-in-Time Restore** to instantly revert the database branch to 1 minute before the deployment occurred.

## 8. Backup & Recovery Plan

Data integrity is critical for the Leaderboard.
- **Continuous Backups**: Ensure your PostgreSQL provider (e.g., Neon.tech) has continuous WAL archiving enabled. This allows point-in-time recovery for up to 7 days.
- **Snapshot Backups**: 
  - Immediately following the conclusion of Checkpoint 1 and Checkpoint 2, take a manual database snapshot via your provider's dashboard.
- **Disaster Recovery**:
  - In the event of catastrophic data corruption, use Neon's "Restore to Branch" feature to spin up a recovered database, update the Vercel `DATABASE_URL` environment variable, and redeploy.
