-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_ENABLED';
ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_DISABLED';
ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_OPENED';
ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_CLOSED';
ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_TEMPORARILY_CLOSED';
ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_CAMERA_ON';
ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_CAMERA_OFF';
ALTER TYPE "AuditAction" ADD VALUE 'OUTLET_CAMERA_MAINTENANCE';
