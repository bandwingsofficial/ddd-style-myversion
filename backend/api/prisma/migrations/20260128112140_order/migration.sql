/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `OrderEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderEventType" ADD VALUE 'CREATED';
ALTER TYPE "OrderEventType" ADD VALUE 'PAYMENT_PENDING';

-- AlterTable
ALTER TABLE "OrderEvent" ADD COLUMN     "actorId" TEXT,
ADD COLUMN     "actorType" "ActorType",
ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "note" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "OrderEvent_idempotencyKey_key" ON "OrderEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "OrderEvent_orderId_type_idx" ON "OrderEvent"("orderId", "type");
