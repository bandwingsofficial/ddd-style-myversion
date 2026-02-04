-- DropIndex
DROP INDEX "Product_categoryId_idx";

-- DropIndex
DROP INDEX "Product_categoryId_status_isAvailable_idx";

-- DropIndex
DROP INDEX "Product_slug_idx";

-- DropIndex
DROP INDEX "Product_status_idx";

-- DropIndex
DROP INDEX "ProductImage_productId_idx";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "extraInfo1" VARCHAR(255),
ADD COLUMN     "extraInfo2" VARCHAR(255),
ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");

-- CreateIndex
CREATE INDEX "Product_slug_status_isAvailable_idx" ON "Product"("slug", "status", "isAvailable");

-- CreateIndex
CREATE INDEX "Product_categoryId_status_isAvailable_sortOrder_idx" ON "Product"("categoryId", "status", "isAvailable", "sortOrder");

-- CreateIndex
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");
