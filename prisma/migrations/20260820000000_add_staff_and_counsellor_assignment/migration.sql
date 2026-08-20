-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'COUNSELLOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_email_key" ON "Staff"("email");

-- CreateIndex
CREATE INDEX "Staff_active_idx" ON "Staff"("active");

-- CreateIndex
CREATE INDEX "Staff_role_idx" ON "Staff"("role");

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN "assignedCounsellorId" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_assignedCounsellorId_idx" ON "Conversation"("assignedCounsellorId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assignedCounsellorId_fkey" FOREIGN KEY ("assignedCounsellorId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
