-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ConversationSource" AS ENUM ('WEB', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'HANDED_OFF', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "HandoffTrigger" AS ENUM ('EXPLICIT_HUMAN_REQUEST', 'PRICING_NEGOTIATION', 'VISA_REJECTION_DISTRESS', 'URGENT_TIMELINE', 'COMPLAINT', 'LEGAL_MEDICAL_QUESTION', 'LOW_CONFIDENCE_ANSWER', 'REPEATED_UNSATISFIED_QUESTION', 'MANUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "DemoBookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ATTENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PortalAccessStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "source" "ConversationSource" NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "sessionId" TEXT,
    "name" TEXT,
    "email" TEXT,
    "sourcePage" TEXT,
    "leadScore" INTEGER,
    "leadTier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "toolCalls" JSONB,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandoffEvent" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "trigger" "HandoffTrigger" NOT NULL,
    "triggerDetail" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandoffEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadContext" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "goal" TEXT,
    "targetCountry" TEXT,
    "targetCourse" TEXT,
    "englishLevel" TEXT,
    "budgetRange" TEXT,
    "timeline" TEXT,
    "intake" TEXT,
    "biggestChallenge" TEXT,
    "linkedAssessmentId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoBooking" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "course" TEXT,
    "preferredBatch" TEXT,
    "preferredDate" TIMESTAMP(3),
    "status" "DemoBookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortalAccessRequest" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT,
    "demoBookingId" TEXT,
    "studentName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "course" TEXT,
    "status" "PortalAccessStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "processedBy" TEXT,
    "portalStudentId" TEXT,
    "portalLogin" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitLog" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_sessionId_key" ON "Conversation"("sessionId");

-- CreateIndex
CREATE INDEX "Conversation_phone_idx" ON "Conversation"("phone");

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX "Conversation_createdAt_idx" ON "Conversation"("createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "HandoffEvent_conversationId_idx" ON "HandoffEvent"("conversationId");

-- CreateIndex
CREATE INDEX "HandoffEvent_trigger_idx" ON "HandoffEvent"("trigger");

-- CreateIndex
CREATE UNIQUE INDEX "LeadContext_conversationId_key" ON "LeadContext"("conversationId");

-- CreateIndex
CREATE INDEX "LeadContext_targetCountry_idx" ON "LeadContext"("targetCountry");

-- CreateIndex
CREATE INDEX "LeadContext_targetCourse_idx" ON "LeadContext"("targetCourse");

-- CreateIndex
CREATE INDEX "DemoBooking_conversationId_idx" ON "DemoBooking"("conversationId");

-- CreateIndex
CREATE INDEX "DemoBooking_phone_idx" ON "DemoBooking"("phone");

-- CreateIndex
CREATE INDEX "DemoBooking_status_idx" ON "DemoBooking"("status");

-- CreateIndex
CREATE INDEX "DemoBooking_preferredDate_idx" ON "DemoBooking"("preferredDate");

-- CreateIndex
CREATE INDEX "PortalAccessRequest_email_idx" ON "PortalAccessRequest"("email");

-- CreateIndex
CREATE INDEX "PortalAccessRequest_phone_idx" ON "PortalAccessRequest"("phone");

-- CreateIndex
CREATE INDEX "PortalAccessRequest_status_idx" ON "PortalAccessRequest"("status");

-- CreateIndex
CREATE INDEX "PortalAccessRequest_demoBookingId_idx" ON "PortalAccessRequest"("demoBookingId");

-- CreateIndex
CREATE INDEX "RateLimitLog_identifier_endpoint_createdAt_idx" ON "RateLimitLog"("identifier", "endpoint", "createdAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoffEvent" ADD CONSTRAINT "HandoffEvent_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadContext" ADD CONSTRAINT "LeadContext_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoBooking" ADD CONSTRAINT "DemoBooking_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortalAccessRequest" ADD CONSTRAINT "PortalAccessRequest_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
