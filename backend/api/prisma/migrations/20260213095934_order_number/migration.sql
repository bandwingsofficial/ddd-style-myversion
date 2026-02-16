/*
  Warnings:

  - You are about to drop the column `orderNumber` on the `Order` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Order_orderNumber_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderNumber";
