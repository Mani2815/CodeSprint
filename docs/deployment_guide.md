# Deployment Guide

This document covers the deployment pipeline, environment configuration, and the final production checklist for the Labyrinth CodeSprint Leaderboard.

## 1. Deployment Guide (Vercel + PostgreSQL)

The application is highly optimized for deployment on **Vercel**, utilizing Next.js App Router static generation and Serverless functions.

### PostgreSQL Setup (Neon.tech)
1. Create a new PostgreSQL database (Neon is recommended).
2. Retrieve the pooled connection string. Ensure `?sslmode=require` is appended to the connection string.
3. Save this as `DATABASE_URL`.

### Vercel Setup
1. Push this repository to a GitHub repository.
2. In Vercel, import the repository.
3. Set the Framework Preset to **Next.js**.
4. In the Environment Variables section, add all required variables (see Section 2).
5. Click **Deploy**.
6. Once deployed, run the database migrations and seed scripts against the production database (see `database_guide.md`).
7. Confirm that `/login` is the public authentication entry point and that organizer access continues through the admin login flow.

## 2. Environment Variables Reference

| Variable | Required? | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `NEXTAUTH_SECRET` | Yes | Random 32-byte string used to encrypt JWT sessions. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | The canonical URL of your deployment (e.g., `https://codesprint.app`). |
| `NEXT_PUBLIC_ACTIVE_EVENT_SLUG` | Yes | Slug of the event to display (e.g., `codesprint-2026`). Must match the database seed. |
| `NEXT_PUBLIC_EVENT_START_DATE` | Yes | ISO 8601 start date/time for the homepage countdown. |
| `GITHUB_CLIENT_ID` | Yes | OAuth App Client ID (for Participant Login). |
| `GITHUB_CLIENT_SECRET` | Yes | OAuth App Client Secret. |
| `GITHUB_API_TOKEN` | Yes | Fine-grained GitHub PAT for the cron synchronization service. |
| `GITHUB_REPOSITORIES` | Yes | Comma-separated list of repository URLs to track. |
| `GITHUB_SYNC_CHECKPOINT_ORDER` | Yes | The checkpoint order (e.g., `1`) to associate current GitHub activity with. |
| `GITHUB_SPRINT_START_ISO` | Yes | ISO timestamp used to filter commits/PRs during sync. |
| `CRON_SECRET` | Yes | Secure bearer token to protect the cron endpoint from unauthorized execution. |

## 3. Production Deployment Checklist

Before announcing the event, ensure the following are completed:
- [ ] Database is provisioned and connection string works locally.
- [ ] Vercel project created and linked to the repository.
- [ ] All environment variables from the reference table are populated in Vercel.
- [ ] GitHub OAuth App is created with the correct `Authorization callback URL` (`https://<your-domain>/api/auth/callback/github`).
- [ ] GitHub Fine-Grained PAT is generated with `Read-Only` access to the target public repositories.
- [ ] The production database is seeded with `npm run db:seed`.
- [ ] At least one admin account is created via `npx tsx scripts/create-admin.ts`.
- [ ] Vercel Cron is verified by checking the Vercel Logs at 2:00 AM UTC or by manually triggering `/api/cron/github-sync` with the `CRON_SECRET`.
