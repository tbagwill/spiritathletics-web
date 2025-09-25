-- Add multiple images and sizing guide to ShopProduct
ALTER TABLE "public"."ShopProduct"
ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN "sizingGuideImageUrl" TEXT;


