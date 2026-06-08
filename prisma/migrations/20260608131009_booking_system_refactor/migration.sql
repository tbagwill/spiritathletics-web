-- AlterTable: add slotIntervalMinutes to AvailabilityRule
ALTER TABLE "AvailabilityRule" ADD COLUMN "slotIntervalMinutes" INTEGER NOT NULL DEFAULT 30;

-- AlterTable: add startDate and endDate to ClassTemplate
ALTER TABLE "ClassTemplate" ADD COLUMN "startDate" TIMESTAMP(3);
ALTER TABLE "ClassTemplate" ADD COLUMN "endDate" TIMESTAMP(3);

-- AlterTable: add isManualBlock to Booking
ALTER TABLE "Booking" ADD COLUMN "isManualBlock" BOOLEAN NOT NULL DEFAULT false;
