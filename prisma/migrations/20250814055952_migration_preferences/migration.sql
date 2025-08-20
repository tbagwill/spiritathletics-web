-- CreateTable
CREATE TABLE "CoachSettings" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "mustApproveRequests" BOOLEAN NOT NULL DEFAULT false,
    "alertEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emailBookingConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "emailBookingCancelled" BOOLEAN NOT NULL DEFAULT true,
    "dailyAgendaEmail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CoachSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CoachSettings_coachId_key" ON "CoachSettings"("coachId");

-- AddForeignKey
ALTER TABLE "CoachSettings" ADD CONSTRAINT "CoachSettings_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
