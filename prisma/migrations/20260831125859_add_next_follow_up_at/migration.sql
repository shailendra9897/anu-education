-- AlterTable
ALTER TABLE "AdmissionEnrollment" ADD COLUMN     "nextFollowUpAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "AdmissionEnrollment_nextFollowUpAt_idx" ON "AdmissionEnrollment"("nextFollowUpAt");
