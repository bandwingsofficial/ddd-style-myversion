/*
  Warnings:

  - Made the column `categoryId` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitType` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitValue` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL,
ALTER COLUMN "unitType" SET NOT NULL,
ALTER COLUMN "unitValue" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
