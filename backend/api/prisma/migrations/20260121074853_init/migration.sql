/*
  Warnings:

  - You are about to drop the column `deliveryAddress` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryFee` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPartnerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `discountTotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `grandTotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `isPriority` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `itemTotal` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `orderType` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `otpForDelivery` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `platformFee` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `preparationTime` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shortId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `Order` table. All the data in the column will be lost.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderTimeline` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_deliveryPartnerId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "OrderTimeline" DROP CONSTRAINT "OrderTimeline_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropIndex
DROP INDEX "Order_createdAt_idx";

-- DropIndex
DROP INDEX "Order_shortId_key";

-- DropIndex
DROP INDEX "Order_status_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deliveryAddress",
DROP COLUMN "deliveryFee",
DROP COLUMN "deliveryPartnerId",
DROP COLUMN "discountTotal",
DROP COLUMN "grandTotal",
DROP COLUMN "isPriority",
DROP COLUMN "itemTotal",
DROP COLUMN "notes",
DROP COLUMN "orderType",
DROP COLUMN "otpForDelivery",
DROP COLUMN "platformFee",
DROP COLUMN "preparationTime",
DROP COLUMN "shortId",
DROP COLUMN "tax",
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'CREATED';

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "OrderTimeline";

-- DropTable
DROP TABLE "Payment";

-- DropEnum
DROP TYPE "OrderFlowStatus";

-- DropEnum
DROP TYPE "OrderType";

-- DropEnum
DROP TYPE "PaymentStatus";
