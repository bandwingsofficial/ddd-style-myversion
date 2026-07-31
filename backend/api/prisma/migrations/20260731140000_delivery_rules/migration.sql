-- CreateEnum
CREATE TYPE "DeliveryRuleStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "DeliveryRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minimumOrderAmount" DECIMAL(12,2) NOT NULL,
    "deliveryFee" DECIMAL(12,2) NOT NULL,
    "isFreeDelivery" BOOLEAN NOT NULL DEFAULT false,
    "status" "DeliveryRuleStatus" NOT NULL DEFAULT 'INACTIVE',
    "priority" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryRule_priority_key" ON "DeliveryRule"("priority");

-- CreateIndex
CREATE INDEX "DeliveryRule_status_idx" ON "DeliveryRule"("status");

-- CreateIndex
CREATE INDEX "DeliveryRule_minimumOrderAmount_idx" ON "DeliveryRule"("minimumOrderAmount");

-- AlterTable Cart
ALTER TABLE "Cart" ADD COLUMN "deliveryRuleId" TEXT,
ADD COLUMN "deliveryRuleName" TEXT,
ADD COLUMN "deliveryRuleMinimumOrderAmount" DECIMAL(12,2),
ADD COLUMN "isFreeDelivery" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "amountToFreeDelivery" DECIMAL(12,2);

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN "deliveryRuleId" TEXT,
ADD COLUMN "deliveryRuleName" TEXT,
ADD COLUMN "deliveryRuleMinimumOrderAmount" DECIMAL(12,2),
ADD COLUMN "isFreeDelivery" BOOLEAN NOT NULL DEFAULT false;
