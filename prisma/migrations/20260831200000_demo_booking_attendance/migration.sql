-- S6-D2-B: counsellor-controlled FREE demo attendance.
-- ADDITIVE ONLY — creates 1 new enum (DemoBookingEventAction), 1 new
-- table (DemoBookingEvent) + its indexes/constraints, extends the
-- existing DemoBookingStatus enum with 'NO_SHOW', and ADDS columns to
-- the existing DemoBooking table. No table is dropped, no column is
-- dropped, no historical row is modified, and the intentionally
-- unmanaged legacy tables are left untouched. No backfill required.

-- AlterEnum (additive: append NO_SHOW to DemoBookingStatus)
ALTER TYPE "DemoBookingStatus" ADD VALUE 'NO_SHOW';

-- CreateEnum
CREATE TYPE "DemoBookingEventAction" AS ENUM ('MARKED_ATTENDED', 'MARKED_NO_SHOW', 'CANCELLED');

-- AlterTable (additive columns on DemoBooking)
ALTER TABLE "DemoBooking" ADD COLUMN "attendedAt" TIMESTAMP(3),
ADD COLUMN "noShowAt" TIMESTAMP(3),
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "attendanceNote" TEXT,
ADD COLUMN "attendanceVerifiedByStaffId" TEXT;

-- CreateIndex
CREATE INDEX "DemoBooking_attendanceVerifiedByStaffId_idx" ON "DemoBooking"("attendanceVerifiedByStaffId");

-- CreateTable
CREATE TABLE "DemoBookingEvent" (
    "id" TEXT NOT NULL,
    "demoBookingId" TEXT NOT NULL,
    "action" "DemoBookingEventAction" NOT NULL,
    "previousStatus" "DemoBookingStatus",
    "nextStatus" "DemoBookingStatus" NOT NULL,
    "staffId" TEXT,
    "note" TEXT,
    "eventKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoBookingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DemoBookingEvent_demoBookingId_createdAt_idx" ON "DemoBookingEvent"("demoBookingId", "createdAt");

-- CreateIndex
CREATE INDEX "DemoBookingEvent_action_idx" ON "DemoBookingEvent"("action");

-- CreateIndex
CREATE UNIQUE INDEX "DemoBookingEvent_demoBookingId_eventKey_key" ON "DemoBookingEvent"("demoBookingId", "eventKey");

-- AddForeignKey
ALTER TABLE "DemoBooking" ADD CONSTRAINT "DemoBooking_attendanceVerifiedByStaffId_fkey" FOREIGN KEY ("attendanceVerifiedByStaffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoBookingEvent" ADD CONSTRAINT "DemoBookingEvent_demoBookingId_fkey" FOREIGN KEY ("demoBookingId") REFERENCES "DemoBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoBookingEvent" ADD CONSTRAINT "DemoBookingEvent_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
