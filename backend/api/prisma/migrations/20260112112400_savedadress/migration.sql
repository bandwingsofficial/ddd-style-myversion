-- CreateEnum
CREATE TYPE "SavedAddressType" AS ENUM ('HOME', 'WORK', 'OTHER');

-- CreateTable
CREATE TABLE "CustomerSavedAddress" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" "SavedAddressType" NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "addressText" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSavedAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerSavedAddress_customerId_idx" ON "CustomerSavedAddress"("customerId");

-- CreateIndex
CREATE INDEX "CustomerSavedAddress_type_idx" ON "CustomerSavedAddress"("type");

-- CreateIndex
CREATE INDEX "CustomerSavedAddress_isDeleted_idx" ON "CustomerSavedAddress"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSavedAddress_customerId_type_key" ON "CustomerSavedAddress"("customerId", "type");

-- AddForeignKey
ALTER TABLE "CustomerSavedAddress" ADD CONSTRAINT "CustomerSavedAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
