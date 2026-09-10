CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "oldValue" JSONB,
  "newValue" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
