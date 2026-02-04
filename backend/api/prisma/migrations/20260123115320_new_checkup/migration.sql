/*
  Warnings:

  - A unique constraint covering the columns `[providerRefId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CustomerSavedAddress_customerId_type_key";

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Cart_sessionId_idx" ON "Cart"("sessionId");

-- CreateIndex
CREATE INDEX "Cart_customerId_status_idx" ON "Cart"("customerId", "status");

-- CreateIndex
CREATE INDEX "CustomerSavedAddress_customerId_type_idx" ON "CustomerSavedAddress"("customerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerRefId_key" ON "Payment"("providerRefId");
