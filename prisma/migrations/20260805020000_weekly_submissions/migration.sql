CREATE TYPE "SubmissionVerificationStatus" AS ENUM ('VERIFIED', 'VERIFICATION_REQUIRED', 'ANALYSIS_FAILED');

CREATE TABLE "weekly_submissions" (
  "id" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "checkpointId" TEXT NOT NULL,
  "projectTitle" TEXT NOT NULL,
  "projectDescription" TEXT NOT NULL,
  "repositoryUrl" TEXT NOT NULL,
  "demoUrl" TEXT,
  "presentationUrl" TEXT,
  "additionalNotes" TEXT,
  "verificationStatus" "SubmissionVerificationStatus" NOT NULL DEFAULT 'VERIFICATION_REQUIRED',
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "weekly_submissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "weekly_submissions_teamId_checkpointId_key" ON "weekly_submissions"("teamId", "checkpointId");
CREATE INDEX "weekly_submissions_checkpointId_idx" ON "weekly_submissions"("checkpointId");
ALTER TABLE "weekly_submissions" ADD CONSTRAINT "weekly_submissions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "weekly_submissions" ADD CONSTRAINT "weekly_submissions_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "submission_analytics" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "totalCommits" INTEGER NOT NULL DEFAULT 0,
  "pullRequestCount" INTEGER NOT NULL DEFAULT 0,
  "activeDays" INTEGER NOT NULL DEFAULT 0,
  "lastCommitAt" TIMESTAMP(3),
  "repositoryHealth" TEXT NOT NULL,
  "contributors" JSONB NOT NULL,
  "memberMetrics" JSONB NOT NULL,
  "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "submission_analytics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "submission_analytics_submissionId_key" ON "submission_analytics"("submissionId");
ALTER TABLE "submission_analytics" ADD CONSTRAINT "submission_analytics_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "weekly_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
