-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Product_categoryId_status_isAvailable_idx" ON "Product"("categoryId", "status", "isAvailable");
