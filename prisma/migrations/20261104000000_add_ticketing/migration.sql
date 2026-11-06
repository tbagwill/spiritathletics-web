-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TicketTierCode" AS ENUM ('STANDARD', 'SENIOR_CHILD', 'VIP');

-- CreateEnum
CREATE TYPE "TicketOrderStatus" AS ENUM ('PAID', 'REFUNDED', 'CANCELED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'VOIDED');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "venue" TEXT,
    "venueAddress" TEXT,
    "heroImageUrl" TEXT,
    "startDateTimeUTC" TIMESTAMP(3) NOT NULL,
    "doorsOpenUTC" TIMESTAMP(3),
    "endDateTimeUTC" TIMESTAMP(3),
    "salesOpenAtUTC" TIMESTAMP(3) NOT NULL,
    "earlyBirdEndsAtUTC" TIMESTAMP(3) NOT NULL,
    "doorSalesOpenAtUTC" TIMESTAMP(3) NOT NULL,
    "salesCloseAtUTC" TIMESTAMP(3) NOT NULL,
    "convenienceFeeCents" INTEGER NOT NULL DEFAULT 300,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketTier" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tierCode" "TicketTierCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "earlyBirdPriceCents" INTEGER NOT NULL,
    "doorPriceCents" INTEGER NOT NULL,
    "capacity" INTEGER,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "showOnline" BOOLEAN NOT NULL DEFAULT true,
    "earlyBirdEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TicketTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketOrder" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "feeCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "status" "TicketOrderStatus" NOT NULL DEFAULT 'PAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "qrToken" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'ACTIVE',
    "redeemedAt" TIMESTAMP(3),
    "redeemedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_startDateTimeUTC_idx" ON "Event"("status", "startDateTimeUTC");

-- CreateIndex
CREATE INDEX "TicketTier_eventId_idx" ON "TicketTier"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketTier_eventId_tierCode_key" ON "TicketTier"("eventId", "tierCode");

-- CreateIndex
CREATE UNIQUE INDEX "TicketOrder_stripeSessionId_key" ON "TicketOrder"("stripeSessionId");

-- CreateIndex
CREATE INDEX "TicketOrder_eventId_createdAt_idx" ON "TicketOrder"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "TicketOrder_email_idx" ON "TicketOrder"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_qrToken_key" ON "Ticket"("qrToken");

-- CreateIndex
CREATE INDEX "Ticket_orderId_idx" ON "Ticket"("orderId");

-- CreateIndex
CREATE INDEX "Ticket_tierId_status_idx" ON "Ticket"("tierId", "status");

-- AddForeignKey
ALTER TABLE "TicketTier" ADD CONSTRAINT "TicketTier_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketOrder" ADD CONSTRAINT "TicketOrder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "TicketOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "TicketTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

