-- Add nullable phone column first.
-- Existing CustomerProfile rows are preserved.
ALTER TABLE "CustomerProfile"
ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- Populate existing profiles from the authoritative Customer.phone.
-- Only fills missing profile phones.
UPDATE "CustomerProfile" cp
SET "phone" = c."phone"
FROM "Customer" c
WHERE cp."customerId" = c."id"
  AND cp."phone" IS NULL;

-- Enforce uniqueness after existing data has been populated.
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerProfile_phone_key"
ON "CustomerProfile"("phone");