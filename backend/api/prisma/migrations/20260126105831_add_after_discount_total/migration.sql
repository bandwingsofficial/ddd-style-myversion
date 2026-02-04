/*
  Warnings:

  - Made the column `lineTotal` on table `CartItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "lineTotal" SET NOT NULL;
