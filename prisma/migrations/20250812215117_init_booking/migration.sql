-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COACH', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('PRIVATE', 'CLASS');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OccurrenceStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WeeklyRuleType" AS ENUM ('WEEKLY');

-- CreateEnum
CREATE TYPE "PrivateKind" AS ENUM ('SOLO', 'SEMI_PRIVATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CoachProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "coachId" TEXT,
    "type" "ServiceType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "basePriceCents" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityRule" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "ruleType" "WeeklyRuleType" NOT NULL,
    "byDay" TEXT[],
    "startTimeMinutes" INTEGER NOT NULL,
    "endTimeMinutes" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityException" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailabilityException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassTemplate" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTimeMinutes" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ClassTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassOccurrence" (
    "id" TEXT NOT NULL,
    "classTemplateId" TEXT NOT NULL,
    "startDateTimeUTC" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "OccurrenceStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "ClassOccurrence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "privateKind" "PrivateKind",
    "numAthletes" INTEGER NOT NULL DEFAULT 1,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "athleteName" TEXT NOT NULL,
    "notes" TEXT,
    "coachId" TEXT,
    "serviceId" TEXT NOT NULL,
    "classOccurrenceId" TEXT,
    "startDateTimeUTC" TIMESTAMP(3) NOT NULL,
    "endDateTimeUTC" TIMESTAMP(3) NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "perAthletePriceCents" INTEGER,
    "cancellationToken" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerUserId" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancellationPolicy" (
    "id" TEXT NOT NULL,
    "minHoursNotice" INTEGER NOT NULL,

    CONSTRAINT "CancellationPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CoachProfile_userId_key" ON "CoachProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassOccurrence_classTemplateId_startDateTimeUTC_key" ON "ClassOccurrence"("classTemplateId", "startDateTimeUTC");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_cancellationToken_key" ON "Booking"("cancellationToken");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "CoachProfile" ADD CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityRule" ADD CONSTRAINT "AvailabilityRule_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityException" ADD CONSTRAINT "AvailabilityException_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTemplate" ADD CONSTRAINT "ClassTemplate_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassOccurrence" ADD CONSTRAINT "ClassOccurrence_classTemplateId_fkey" FOREIGN KEY ("classTemplateId") REFERENCES "ClassTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_classOccurrenceId_fkey" FOREIGN KEY ("classOccurrenceId") REFERENCES "ClassOccurrence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
