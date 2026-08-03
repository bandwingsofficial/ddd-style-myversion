-- Extend ProductStatus enum for enterprise lifecycle management
ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'OUT_OF_STOCK';
ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'ARCHIVED';
ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'SOFT_DELETED';
