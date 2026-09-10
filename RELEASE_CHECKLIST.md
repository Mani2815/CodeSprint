# CodeSprint Release Checklist

Before pushing a new release to production or merging a major feature into the `main` branch, ensure all items on this checklist are completed and verified.

## 1. Environment & Configuration
- [ ] Ensure `.env.example` is fully up-to-date with all required environment variables.
- [ ] Verify there are no hardcoded secrets, API keys, or database URLs in the codebase.
- [ ] Verify `NEXT_PUBLIC_ACTIVE_EVENT_SLUG` corresponds to the current competition event.
- [ ] Ensure `CRON_SECRET` matches the Vercel cron configuration for GitHub background syncs.

## 2. Dependencies & Build
- [ ] Run `npm run lint` - Must return 0 warnings/errors.
- [ ] Run `npm run typecheck` - Must pass successfully.
- [ ] Run `npm run build` - Ensure the Next.js production bundle compiles cleanly.
- [ ] Verify that unused dependencies have been removed.

## 3. Database (Prisma)
- [ ] Ensure all schema changes are fully migrated (`npx prisma migrate dev`).
- [ ] Never run `npx prisma db push` in production. Always use `npx prisma migrate deploy`.
- [ ] Verify that the `prisma/seed.ts` script functions correctly in an empty staging database.
- [ ] Check neon.tech database connection limits to prevent connection pooling exhaustion during high load.

## 4. Security & Logging
- [ ] Ensure `console.error` calls that leak sensitive DB or user information are removed.
- [ ] Verify `audit-service.ts` correctly captures all `logAdminAction` calls.
- [ ] Ensure `next-auth` is configured with an adequately secure `NEXTAUTH_SECRET` generated via `openssl rand -base64 32`.

## 5. Deployment
- [ ] Create a deployment tag (e.g. `v1.0.0`).
- [ ] Verify that Vercel settings for `Node.js` version match `package.json` engines (>=18.18.0).
- [ ] Manually test the auth flow in a staging environment before switching production traffic.
- [ ] Verify the GitHub App API Token (if used) is not expired.
