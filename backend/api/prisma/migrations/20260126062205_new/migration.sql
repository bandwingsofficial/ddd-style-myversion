/*
  Warnings:

  - A unique constraint covering the columns `[customerId,outletId,status]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Cart_customerId_status_idx";

-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "quantity" SET DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_customerId_outletId_status_key" ON "Cart"("customerId", "outletId", "status");
