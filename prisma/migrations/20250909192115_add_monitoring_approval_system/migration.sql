/*
  Warnings:

  - A unique constraint covering the columns `[approvalToken]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('BOOKING_REQUEST', 'BOOKING_REMINDER', 'BOOKING_APPROVED', 'BOOKING_DENIED', 'BOOKING_EXPIRED', 'DAILY_SUMMARY');

-- CreateEnum
CREATE TYPE "public"."QueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."MetricType" AS ENUM ('API_LATENCY', 'DATABASE_QUERY', 'MEMORY_USAGE', 'CACHE_HIT_RATE', 'BOOKING_RATE', 'ERROR_RATE');

-- CreateEnum
CREATE TYPE "public"."ErrorLevel" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "approvalStatus" "public"."ApprovalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "approvalToken" TEXT,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "autoExpireAt" TIMESTAMP(3),
ADD COLUMN     "denialReason" TEXT,
ADD COLUMN     "deniedAt" TIMESTAMP(3),
ADD COLUMN     "reminderSentAt" TIMESTAMP(3),
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."NotificationPreference" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "emailOnRequest" BOOLEAN NOT NULL DEFAULT true,
    "emailReminder" BOOLEAN NOT NULL DEFAULT true,
    "reminderHours" INTEGER NOT NULL DEFAULT 6,
    "dashboardBadge" BOOLEAN NOT NULL DEFAULT true,
    "soundAlert" BOOLEAN NOT NULL DEFAULT false,
    "dailySummary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationQueue" (
    "id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" "public"."QueueStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "error" TEXT,
    "scheduledFor" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemMetric" (
    "id" TEXT NOT NULL,
    "type" "public"."MetricType" NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ErrorLog" (
    "id" TEXT NOT NULL,
    "level" "public"."ErrorLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "context" JSONB,
    "userId" TEXT,
    "url" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PerformanceLog" (
    "id" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UploadedImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "type" TEXT NOT NULL,
    "variants" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadedImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_coachId_key" ON "public"."NotificationPreference"("coachId");

-- CreateIndex
CREATE INDEX "NotificationQueue_status_scheduledFor_idx" ON "public"."NotificationQueue"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "NotificationQueue_recipientId_idx" ON "public"."NotificationQueue"("recipientId");

-- CreateIndex
CREATE INDEX "SystemMetric_type_timestamp_idx" ON "public"."SystemMetric"("type", "timestamp");

-- CreateIndex
CREATE INDEX "SystemMetric_name_timestamp_idx" ON "public"."SystemMetric"("name", "timestamp");

-- CreateIndex
CREATE INDEX "ErrorLog_level_timestamp_idx" ON "public"."ErrorLog"("level", "timestamp");

-- CreateIndex
CREATE INDEX "ErrorLog_resolved_timestamp_idx" ON "public"."ErrorLog"("resolved", "timestamp");

-- CreateIndex
CREATE INDEX "PerformanceLog_route_timestamp_idx" ON "public"."PerformanceLog"("route", "timestamp");

-- CreateIndex
CREATE INDEX "PerformanceLog_duration_idx" ON "public"."PerformanceLog"("duration");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_approvalToken_key" ON "public"."Booking"("approvalToken");

-- CreateIndex
CREATE INDEX "Booking_approvalStatus_coachId_idx" ON "public"."Booking"("approvalStatus", "coachId");

-- CreateIndex
CREATE INDEX "Booking_autoExpireAt_idx" ON "public"."Booking"("autoExpireAt");

-- AddForeignKey
ALTER TABLE "public"."NotificationPreference" ADD CONSTRAINT "NotificationPreference_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
