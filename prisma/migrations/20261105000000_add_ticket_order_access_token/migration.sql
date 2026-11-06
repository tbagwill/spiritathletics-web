-- Additive: per-order access token for the ticket page and the order-level check-in QR.
ALTER TABLE "TicketOrder" ADD COLUMN "accessToken" TEXT;

-- Backfill any existing orders (test orders) with ~244 bits of randomness.
UPDATE "TicketOrder"
SET "accessToken" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE "accessToken" IS NULL;

ALTER TABLE "TicketOrder" ALTER COLUMN "accessToken" SET NOT NULL;

CREATE UNIQUE INDEX "TicketOrder_accessToken_key" ON "TicketOrder"("accessToken");
