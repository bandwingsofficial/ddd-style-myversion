/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - Added the required column `afterDiscountTotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grandTotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "totalAmount",
ADD COLUMN     "afterDiscountTotal" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "grandTotal" DECIMAL(12,2) NOT NULL,
ALTER COLUMN "discount" DROP DEFAULT,
ALTER COLUMN "itemCount" DROP DEFAULT;
