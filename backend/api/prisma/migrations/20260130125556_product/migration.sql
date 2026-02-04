-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Product_productName_idx" ON "Product"("productName");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_isTrending_idx" ON "Product"("isTrending");
