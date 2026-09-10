# Troubleshooting Guide

This guide covers common issues encountered during local development, deployment, and event operations.

## 1. Database & Migrations

### Error: `PrismaClientInitializationError: Can't reach database server`
- **Cause**: The `DATABASE_URL` is incorrect or the Neon database is paused/asleep.
- **Fix**: Check your `.env` file. Ensure the connection string includes `?sslmode=require`.

### Error: `Unique constraint failed on the fields: (...)`
- **Cause**: You are trying to insert a duplicate record (e.g., adding a team with an existing name).
- **Fix**: The UI should catch this, but if running a script, ensure the data is unique.

## 2. GitHub Synchronization

### Error: `HTTP 401 Bad credentials` during GitHub Sync
- **Cause**: The `GITHUB_API_TOKEN` is invalid, expired, or incorrectly formatted. (Note: Ensure you are using a GitHub PAT, not an RSA Private Key).
- **Fix**: Generate a new Fine-grained PAT from GitHub Developer Settings and update the environment variable.

### Error: `No checkpoint 1 exists for event codesprint-2026.`
- **Cause**: The cron job relies on the active event and checkpoint existing in the database, but the database is empty.
- **Fix**: Run `npm run db:seed` to populate the foundational event structures.

## 3. Authentication & Sessions

### Issue: Cannot login to Admin Dashboard
- **Cause**: Admin accounts do not have a registration page. You must manually provision the account.
- **Fix**: Run `npx tsx scripts/create-admin.ts <username> <password> "<Name>"` in the terminal.

### Issue: GitHub OAuth login fails (Redirects to error page)
- **Cause**: The OAuth callback URL in GitHub does not match your Vercel domain, or the Client ID/Secret are mismatched.
- **Fix**: Ensure your GitHub OAuth app is configured with `https://<your-domain>/api/auth/callback/github` and the credentials in Vercel match exactly.

## 4. Leaderboard Ranking

### Issue: Scores are not updating on the public leaderboard
- **Cause**: The leaderboard is statically cached or the database hasn't processed the upsert. Next.js App Router aggressively caches data by default.
- **Fix**: The application uses `revalidatePath` in the mutation APIs to clear the cache. If it fails, ensure the API route handling the score update explicitly calls `revalidatePath('/leaderboard')`.
