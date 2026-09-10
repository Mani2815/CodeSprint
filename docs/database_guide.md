# Database Guide

This document covers database initialization, seeding, and backup strategies.

## 1. Database Setup Guide

The project uses **Prisma** as its ORM. The database schema is defined in `prisma/schema.prisma`.

### Initializing the Database
1. Ensure your `DATABASE_URL` is set in `.env`.
2. Push the schema to the database:
   ```bash
   npm run db:push
   ```
   *Note: Use `db:push` during active prototyping. Once the event goes live, transition to `npm run db:migrate` if schema changes are required.*
3. Generate the Prisma Client:
   ```bash
   npm run db:generate
   ```

## 2. Seed Guide

The application **requires** base data (Events and Checkpoints) to function. Currently, there is no UI to create this foundational data; it must be seeded manually.

### Running the Seed Script
Execute the following command:
```bash
npm run db:seed
```

### What does the seed script do?
The script (`prisma/seed.ts`) is idempotent. It will:
1. Create an `Event` with the slug defined in `NEXT_PUBLIC_ACTIVE_EVENT_SLUG` (defaults to `codesprint-2026`).
2. Create 2 `Checkpoint` records linked to this event (Checkpoint 1 and Checkpoint 2).
3. Set the maximum score parameters for each checkpoint.

### Why is this required?
- The Admin Dashboard relies on Checkpoints existing to render the score entry tables.
- The GitHub Sync cron job relies on Checkpoints existing to attach GitHub activity to a specific time period.

## 3. Backup & Recovery Guide

### Neon.tech Built-in Backups
If you are using Neon Serverless Postgres (recommended), point-in-time recovery is built-in.
- **Backup**: Continuous WAL archiving is automatic.
- **Restore**: Use the Neon dashboard to branch your database from a specific point in time or restore the main branch directly.

### Manual Prisma Backups
To create a localized backup of your data (e.g., post-event archiving):
1. **Exporting Data**: Use Prisma Studio (`npm run db:studio`) to export records to CSV/JSON, or use standard `pg_dump` utilities.
2. **Archiving**: It is highly recommended to take a snapshot of the database immediately after the final judging phase is completed to preserve the definitive leaderboard state.
