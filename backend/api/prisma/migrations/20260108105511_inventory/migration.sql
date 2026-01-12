-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StockTransactionType" AS ENUM ('INITIALIZE', 'ADD', 'ADJUST', 'TRANSFER');

-- CreateEnum
CREATE TYPE "StockSource" AS ENUM ('CENTRAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "StockDestination" AS ENUM ('CENTRAL', 'OUTLET');

-- AlterTable
ALTER TABLE "StockItem" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "CentralInventory" (
    "id" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "unit" "Unit" NOT NULL,
    "availableQty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "totalQty" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "status" "InventoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CentralInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransaction" (
    "id" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "type" "StockTransactionType" NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "source" "StockSource" NOT NULL,
    "destination" "StockDestination" NOT NULL,
    "outletId" TEXT,
    "performedBy" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutletStock" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "unit" "Unit" NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutletStock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CentralInventory_stockItemId_key" ON "CentralInventory"("stockItemId");

-- CreateIndex
CREATE INDEX "CentralInventory_stockItemId_idx" ON "CentralInventory"("stockItemId");

-- CreateIndex
CREATE INDEX "CentralInventory_status_idx" ON "CentralInventory"("status");

-- CreateIndex
CREATE INDEX "StockTransaction_stockItemId_idx" ON "StockTransaction"("stockItemId");

-- CreateIndex
CREATE INDEX "StockTransaction_inventoryId_idx" ON "StockTransaction"("inventoryId");

-- CreateIndex
CREATE INDEX "StockTransaction_type_idx" ON "StockTransaction"("type");

-- CreateIndex
CREATE INDEX "StockTransaction_createdAt_idx" ON "StockTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "OutletStock_outletId_idx" ON "OutletStock"("outletId");

-- CreateIndex
CREATE INDEX "OutletStock_stockItemId_idx" ON "OutletStock"("stockItemId");

-- CreateIndex
CREATE UNIQUE INDEX "OutletStock_outletId_stockItemId_key" ON "OutletStock"("outletId", "stockItemId");

-- AddForeignKey
ALTER TABLE "CentralInventory" ADD CONSTRAINT "CentralInventory_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "CentralInventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletStock" ADD CONSTRAINT "OutletStock_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletStock" ADD CONSTRAINT "OutletStock_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
