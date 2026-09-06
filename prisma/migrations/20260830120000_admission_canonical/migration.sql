-- S6-B1: canonical admission/conversion record + immutable event history.
-- ADDITIVE ONLY — creates 3 new enums, 2 new tables and their indexes/
-- constraints. No existing table is altered, and the intentionally
-- unmanaged legacy tables (whatsapp_leads, Google Sheet CRM silo) are
-- left completely untouched.

-- CreateEnum
CREATE TYPE "AdmissionState" AS ENUM ('INTERESTED', 'COUNSELLOR_CONTACT_PENDING', 'COUNSELLOR_CONTACTED', 'FOLLOW_UP_REQUIRED', 'DOCUMENTS_PENDING', 'PAYMENT_PENDING', 'PAYMENT_VERIFICATION', 'PAYMENT_VERIFIED', 'ADMISSION_CONFIRMED', 'ADMISSION_COMPLETED', 'NOT_INTERESTED', 'LOST');

-- CreateEnum
CREATE TYPE "AdmissionActor" AS ENUM ('STUDENT', 'COUNSELLOR', 'ADMIN', 'SYSTEM', 'AI');

-- CreateEnum
CREATE TYPE "AdmissionEventAction" AS ENUM ('ENROLLMENT_CREATED', 'INTEREST_DETECTED', 'COUNSELLOR_ASSIGNED', 'COUNSELLOR_CONTACTED', 'NOTE_ADDED', 'FOLLOW_UP_REQUIRED', 'FOLLOW_UP_ATTEMPTED', 'DOCUMENTS_REQUESTED', 'PAYMENT_CLAIMED', 'PAYMENT_VERIFICATION_STARTED', 'PAYMENT_VERIFIED', 'ADMISSION_CONFIRMED', 'ADMISSION_COMPLETED', 'NOT_INTERESTED', 'LOST', 'REACTIVATED', 'SYSTEM_NOTE');

-- CreateTable
CREATE TABLE "AdmissionEnrollment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "state" "AdmissionState" NOT NULL DEFAULT 'INTERESTED',
    "assignedCounsellorId" TEXT,
    "contactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionEvent" (
    "id" TEXT NOT NULL,
    "admissionEnrollmentId" TEXT NOT NULL,
    "action" "AdmissionEventAction" NOT NULL,
    "previousState" "AdmissionState",
    "nextState" "AdmissionState" NOT NULL,
    "actor" "AdmissionActor" NOT NULL,
    "actorId" TEXT,
    "reason" TEXT,
    "eventKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdmissionEnrollment_state_idx" ON "AdmissionEnrollment"("state");

-- CreateIndex
CREATE INDEX "AdmissionEnrollment_course_idx" ON "AdmissionEnrollment"("course");

-- CreateIndex
CREATE INDEX "AdmissionEnrollment_assignedCounsellorId_idx" ON "AdmissionEnrollment"("assignedCounsellorId");

-- CreateIndex
CREATE INDEX "AdmissionEnrollment_updatedAt_idx" ON "AdmissionEnrollment"("updatedAt");

-- CreateIndex
CREATE INDEX "AdmissionEnrollment_contactedAt_idx" ON "AdmissionEnrollment"("contactedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionEnrollment_leadId_course_key" ON "AdmissionEnrollment"("leadId", "course");

-- CreateIndex
CREATE INDEX "AdmissionEvent_admissionEnrollmentId_createdAt_idx" ON "AdmissionEvent"("admissionEnrollmentId", "createdAt");

-- CreateIndex
CREATE INDEX "AdmissionEvent_action_idx" ON "AdmissionEvent"("action");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionEvent_admissionEnrollmentId_eventKey_key" ON "AdmissionEvent"("admissionEnrollmentId", "eventKey");

-- AddForeignKey
ALTER TABLE "AdmissionEnrollment" ADD CONSTRAINT "AdmissionEnrollment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionEnrollment" ADD CONSTRAINT "AdmissionEnrollment_assignedCounsellorId_fkey" FOREIGN KEY ("assignedCounsellorId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionEvent" ADD CONSTRAINT "AdmissionEvent_admissionEnrollmentId_fkey" FOREIGN KEY ("admissionEnrollmentId") REFERENCES "AdmissionEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;