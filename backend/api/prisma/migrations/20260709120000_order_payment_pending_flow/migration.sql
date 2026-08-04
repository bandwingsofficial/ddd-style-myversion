-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'EXPIRED';

-- DropIndex
DROP INDEX IF EXISTS "Order_cartId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "paymentExpiresAt" TIMESTAMP(3),
ADD COLUMN "orderNotes" TEXT,
ADD COLUMN "deliveryInstructions" TEXT;

-- CreateIndex
CREATE INDEX "Order_status_paymentExpiresAt_idx" ON "Order"("status", "paymentExpiresAt");
CREATE INDEX "Order_cartId_idx" ON "Order"("cartId");
