-- CreateEnum
CREATE TYPE "ProductMediaType" AS ENUM ('IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN "mediaType" "ProductMediaType" NOT NULL DEFAULT 'IMAGE';
ALTER TABLE "ProductImage" ADD COLUMN "durationSeconds" INTEGER;
