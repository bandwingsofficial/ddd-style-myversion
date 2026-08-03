ALTER TABLE "CustomerSavedAddress"
ADD COLUMN "resolvedOutletId" TEXT;

CREATE INDEX "CustomerSavedAddress_resolvedOutletId_idx"
ON "CustomerSavedAddress"("resolvedOutletId");
