-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'FULFILLED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PAID', 'REFUNDED', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."ShopCampaign" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "heroImageUrl" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopProduct" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductSize" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "priceDelta" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopOrder" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "customerName" TEXT,
    "subtotalCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "stripePaymentId" TEXT,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PAID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShopOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sizeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" INTEGER NOT NULL,
    "lineTotal" INTEGER NOT NULL,

    CONSTRAINT "ShopOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopCampaign_slug_key" ON "public"."ShopCampaign"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShopProduct_campaignId_slug_key" ON "public"."ShopProduct"("campaignId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_productId_label_key" ON "public"."ProductSize"("productId", "label");

-- AddForeignKey
ALTER TABLE "public"."ShopProduct" ADD CONSTRAINT "ShopProduct_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."ShopCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."ShopProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopOrder" ADD CONSTRAINT "ShopOrder_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."ShopCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopOrderItem" ADD CONSTRAINT "ShopOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."ShopOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopOrderItem" ADD CONSTRAINT "ShopOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."ShopProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShopOrderItem" ADD CONSTRAINT "ShopOrderItem_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "public"."ProductSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
