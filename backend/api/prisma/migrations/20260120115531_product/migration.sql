-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('ML', 'LTR', 'G', 'KG', 'PCS');

-- CreateEnum
CREATE TYPE "ProductTag" AS ENUM ('FRESH', 'ORGANIC', 'NO_SUGAR', 'COLD_PRESSED', 'NATURAL', 'FARM_FRESH', 'PRESERVATIVE_FREE', 'VEGAN');

-- DropIndex
DROP INDEX "Product_isTrending_idx";

-- DropIndex
DROP INDEX "Product_status_idx";

-- DropIndex
DROP INDEX "Product_stockItemId_idx";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "ratingAverage" DECIMAL(3,2),
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" "ProductTag"[] DEFAULT ARRAY[]::"ProductTag"[],
ADD COLUMN     "unitType" "UnitType",
ADD COLUMN     "unitValue" INTEGER;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
