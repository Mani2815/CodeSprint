# Labyrinth CodeSprint Leaderboard

Official leaderboard management system for **Labyrinth Computer Science Club's CodeSprint**.

Organizers log in to enter checkpoint scores; participants view a public, read-only, manually-refreshed leaderboard. No real-time syncing of scores — scores are entered by organizers after each evaluation checkpoint, and rankings recalculate automatically.

This repository is feature-complete and contains a full suite of operational documentation to facilitate seamless handovers to future Labyrinth organizers.

## Documentation Index

We have separated the comprehensive documentation into focused guides inside the `docs/` directory to help you manage the event from deployment to final judging.

1. **[Deployment & Environment Guide](docs/deployment_guide.md)**
   - Vercel + PostgreSQL Deployment Guide
   - Environment Variables Reference
   - Production Deployment Checklist
2. **[Database & Operations Guide](docs/database_guide.md)**
   - Database Initialization
   - Seed Guide (Required for Event/Checkpoints)
   - Backup & Recovery Guide
3. **[Event Runbook & User Manuals](docs/user_manuals.md)**
   - CodeSprint Event Runbook (Timeline & Workflow)
   - Admin User Manual
   - Judge User Manual
4. **[GitHub Integration & Cron Guide](docs/github_integration.md)**
   - GitHub Integration Guide (OAuth & PAT Setup)
   - Cron Job Guide & Manual Triggers
5. **[System Architecture](docs/architecture.md)**
   - System Architecture Documentation
   - ER Diagram
   - API Documentation
   - Folder Structure Documentation
6. **[Troubleshooting Guide](docs/troubleshooting.md)**
   - Solutions to common deployment and operational errors.
7. **[Development Log](docs/DEVELOPMENT_LOG.md)**
   - Original phase-by-phase architectural rationale.
8. **[Production Deployment Runbook](docs/production_runbook.md)**
   - Unified DevOps guide, deployment checklist, and rollback strategy.
9. **[Release Checklist](RELEASE_CHECKLIST.md)**
   - Pre-deployment and production hardening checklist.

---

## Quick Start Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL and NEXTAUTH_SECRET at a minimum

# 3. Setup Database
npm run db:push
npm run db:seed  # Required! Creates the CodeSprint event & checkpoints

# 4. Provision your first Admin account
npx tsx scripts/create-admin.ts organizer1 "a-strong-password" "Display Name"

# 5. Start the server
npm run dev
```

Visit `http://localhost:3000` for the public leaderboard. The primary public authentication entry point is `/login`, where organizers choose the admin flow and participants continue with GitHub.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js Route Handlers, Prisma ORM, PostgreSQL
- **Auth:** NextAuth.js
