-- ─────────────────────────────────────────────────────────────────
-- Migration: add_canonical_lead_identity  (Phase 3C / C1)
--
-- 1. Lead        — canonical CRM identity (one person across WEB +
--                  WHATSAPP conversations). FKs to it are nullable +
--                  ON DELETE SET NULL everywhere.
-- 2. Message     — provider identity/status columns (providerId,
--                  providerMessageId, providerStatus).
-- 3. DemoBooking / PortalAccessRequest — nullable Lead backrefs.
-- 4. RateLimitLog — @@unique([identifier, endpoint]) + single-row
--                  requestCount window counter.
--
-- SAFETY (verified live at 2026-08-30 05:24 UTC):
--   * RateLimitLog had 0 duplicate (identifier, endpoint) pairs.
--   * Defensive dedupe below still collapses duplicates that may
--     accumulate between review and apply (legacy append-log rate-
--     limiter rows are redundant; the EARLIEST row per key is the
--     meaningful marker). Deletes nothing of distinct value, and is a
--     no-op when zero duplicates exist.
--   * The legacy, intentionally-unmanaged `whatsapp_leads` table is
--     NOT touched (outside Prisma's schema by design).
--   * No existing Conversation / Message / LeadContext / booking /
--     portal rows are modified; all IDs are preserved; every new FK is
--     nullable (no backfill guesswork).
-- ─────────────────────────────────────────────────────────────────

-- CreateEnum
CREATE TYPE "LeadIdentitySource" AS ENUM ('WEB', 'WHATSAPP');

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "leadId" TEXT;

-- AlterTable
ALTER TABLE "DemoBooking" ADD COLUMN     "leadId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "providerId" TEXT,
ADD COLUMN     "providerMessageId" TEXT,
ADD COLUMN     "providerStatus" TEXT;

-- AlterTable
ALTER TABLE "PortalAccessRequest" ADD COLUMN     "leadId" TEXT;

-- AlterTable
ALTER TABLE "RateLimitLog" ADD COLUMN     "requestCount" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "identitySource" "LeadIdentitySource",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_phone_idx" ON "Lead"("phone");

-- CreateIndex
CREATE INDEX "Lead_identitySource_idx" ON "Lead"("identitySource");

-- CreateIndex
CREATE INDEX "Conversation_leadId_idx" ON "Conversation"("leadId");

-- CreateIndex
CREATE INDEX "DemoBooking_leadId_idx" ON "DemoBooking"("leadId");

-- CreateIndex
CREATE INDEX "PortalAccessRequest_leadId_idx" ON "PortalAccessRequest"("leadId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoBooking" ADD CONSTRAINT "DemoBooking_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalAccessRequest" ADD CONSTRAINT "PortalAccessRequest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Defensive dedupe: keep the earliest RateLimitLog row per
-- (identifier, endpoint) so the unique index below can never fail.
-- No-op when no duplicates exist (verified live: zero dupes).
DELETE FROM "RateLimitLog" rl
USING "RateLimitLog" rl2
WHERE rl."identifier" = rl2."identifier"
  AND rl."endpoint" = rl2."endpoint"
  AND rl."createdAt" > rl2."createdAt";

-- CreateIndex (unique)
CREATE UNIQUE INDEX "RateLimitLog_identifier_endpoint_key" ON "RateLimitLog"("identifier", "endpoint");