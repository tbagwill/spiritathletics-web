-- AlterTable: add isActive to User (soft-deactivate / login blocking)
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
