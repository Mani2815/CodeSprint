-- Participant platform: GitHub identities, activity, ethics acceptance, and token ledger.

CREATE TYPE "TokenReason" AS ENUM ('STREAK', 'HOD_APPROVED', 'SPRINT_WIN', 'MANUAL');

CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "teamId" TEXT,
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "github_activities" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "commitCount" INTEGER NOT NULL DEFAULT 0,
    "prCount" INTEGER NOT NULL DEFAULT 0,
    "sprintWeekId" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "github_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "token_ledger" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "TokenReason" NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "token_ledger_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ethics_acceptances" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" TEXT NOT NULL,
    CONSTRAINT "ethics_acceptances_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "participants_githubId_key" ON "participants"("githubId");
CREATE INDEX "participants_teamId_idx" ON "participants"("teamId");
CREATE UNIQUE INDEX "github_activities_participantId_sprintWeekId_repoUrl_key"
  ON "github_activities"("participantId", "sprintWeekId", "repoUrl");
CREATE INDEX "github_activities_sprintWeekId_idx" ON "github_activities"("sprintWeekId");
CREATE INDEX "token_ledger_participantId_createdAt_idx" ON "token_ledger"("participantId", "createdAt");
CREATE INDEX "token_ledger_approvedById_idx" ON "token_ledger"("approvedById");
CREATE UNIQUE INDEX "ethics_acceptances_participantId_version_key"
  ON "ethics_acceptances"("participantId", "version");

ALTER TABLE "participants"
  ADD CONSTRAINT "participants_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "github_activities"
  ADD CONSTRAINT "github_activities_participantId_fkey"
  FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "github_activities_sprintWeekId_fkey"
  FOREIGN KEY ("sprintWeekId") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "token_ledger"
  ADD CONSTRAINT "token_ledger_participantId_fkey"
  FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "token_ledger_approvedById_fkey"
  FOREIGN KEY ("approvedById") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ethics_acceptances"
  ADD CONSTRAINT "ethics_acceptances_participantId_fkey"
  FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
