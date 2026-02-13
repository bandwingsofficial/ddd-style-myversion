/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `OutletProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OutletProfile" DROP COLUMN "logoUrl",
ADD COLUMN     "avatarUrl" TEXT;
