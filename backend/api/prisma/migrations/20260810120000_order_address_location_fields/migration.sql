-- AlterTable
ALTER TABLE "CustomerSavedAddress" ADD COLUMN "houseNumber" VARCHAR(100),
ADD COLUMN "street" VARCHAR(255),
ADD COLUMN "landmark" VARCHAR(255),
ADD COLUMN "pincode" VARCHAR(10);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "houseNumber" VARCHAR(100),
ADD COLUMN "street" VARCHAR(255),
ADD COLUMN "landmark" VARCHAR(255),
ADD COLUMN "pincode" VARCHAR(10);
