ALTER TABLE "teams" ADD COLUMN "college" TEXT;
ALTER TABLE "github_activities" ADD COLUMN "activeDays" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "github_activities" ADD COLUMN "lastCommitAt" TIMESTAMP(3);

CREATE TABLE "projects" (
  "id" TEXT NOT NULL, "teamId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "description" TEXT, "repoUrl" TEXT, "category" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "projects_teamId_key" ON "projects"("teamId");
ALTER TABLE "projects" ADD CONSTRAINT "projects_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "evaluations" (
  "id" TEXT NOT NULL, "teamId" TEXT NOT NULL, "checkpointId" TEXT NOT NULL,
  "innovation" INTEGER NOT NULL DEFAULT 0, "technical" INTEGER NOT NULL DEFAULT 0,
  "ui" INTEGER NOT NULL DEFAULT 0, "presentation" INTEGER NOT NULL DEFAULT 0,
  "documentation" INTEGER NOT NULL DEFAULT 0, "comments" TEXT,
  "total" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "evaluations_teamId_checkpointId_key" ON "evaluations"("teamId", "checkpointId");
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TABLE "registrations" (
  "id" TEXT NOT NULL, "eventId" TEXT NOT NULL, "teamName" TEXT NOT NULL,
  "projectName" TEXT NOT NULL, "projectDescription" TEXT NOT NULL, "college" TEXT NOT NULL,
  "repositoryUrl" TEXT, "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedAt" TIMESTAMP(3), "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "registrations_eventId_status_idx" ON "registrations"("eventId", "status");
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE TABLE "registration_members" (
  "id" TEXT NOT NULL, "registrationId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "email" TEXT NOT NULL, "phone" TEXT, "githubUsername" TEXT NOT NULL,
  "isLeader" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "registration_members_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "registration_members" ADD CONSTRAINT "registration_members_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
