-- AlterTable
ALTER TABLE "CustomerSavedAddress" ADD COLUMN "resolvedOutletName" TEXT;
ALTER TABLE "CustomerSavedAddress" ADD COLUMN "serviceable" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: addresses with a resolved outlet are serviceable
UPDATE "CustomerSavedAddress"
SET "serviceable" = true
WHERE "resolvedOutletId" IS NOT NULL AND "isDeleted" = false;
