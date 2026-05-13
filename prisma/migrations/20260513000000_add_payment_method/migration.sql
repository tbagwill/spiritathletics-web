-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH');

-- AlterTable: Booking
ALTER TABLE "Booking" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD';

-- AlterTable: ClinicRegistration
ALTER TABLE "ClinicRegistration" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD';
