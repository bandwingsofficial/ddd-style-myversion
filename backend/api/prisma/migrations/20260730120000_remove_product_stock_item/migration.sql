-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_stockItemId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Product_stockItemId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN IF EXISTS "stockItemId";
