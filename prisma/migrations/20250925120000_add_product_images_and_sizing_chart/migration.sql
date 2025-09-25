-- Add multi-image and sizing chart support to ShopProduct
ALTER TABLE "public"."ShopProduct"
  ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "sizingChartUrl" TEXT;

-- Backfill legacy single imageUrl into imageUrls for existing rows (if needed)
UPDATE "public"."ShopProduct"
SET "imageUrls" = ARRAY["imageUrl"]::TEXT[]
WHERE "imageUrl" IS NOT NULL AND ("imageUrls" IS NULL OR cardinality("imageUrls") = 0);


