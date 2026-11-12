-- Additive: extra coaches assigned to a class (the lead coach stays on Service.coachId).
CREATE TABLE "ClassTemplateCoach" (
    "id" TEXT NOT NULL,
    "classTemplateId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassTemplateCoach_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClassTemplateCoach_classTemplateId_coachId_key" ON "ClassTemplateCoach"("classTemplateId", "coachId");
CREATE INDEX "ClassTemplateCoach_coachId_idx" ON "ClassTemplateCoach"("coachId");

ALTER TABLE "ClassTemplateCoach" ADD CONSTRAINT "ClassTemplateCoach_classTemplateId_fkey" FOREIGN KEY ("classTemplateId") REFERENCES "ClassTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassTemplateCoach" ADD CONSTRAINT "ClassTemplateCoach_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
