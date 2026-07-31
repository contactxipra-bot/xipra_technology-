-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "businessHours" TEXT,
ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "companyDescription" TEXT,
ADD COLUMN     "copyrightText" TEXT,
ADD COLUMN     "faviconUrl" TEXT,
ADD COLUMN     "googleMapUrl" TEXT,
ADD COLUMN     "ogImageUrl" TEXT,
ADD COLUMN     "twitterCard" TEXT,
ADD COLUMN     "whatsappNumber" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "adminEmail" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
