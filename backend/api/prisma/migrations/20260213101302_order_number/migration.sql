/*
  Warnings:

  - A unique constraint covering the columns `[orderSequence]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderNumber` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orderNumber" TEXT NOT NULL,
ADD COLUMN     "orderSequence" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderSequence_key" ON "Order"("orderSequence");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
