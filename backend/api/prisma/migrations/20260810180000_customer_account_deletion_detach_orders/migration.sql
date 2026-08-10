-- Detach historical orders from deleted customers (preserve business records).
-- Cart FK already uses ON DELETE SET NULL from init migration.

ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

ALTER TABLE "Order" ALTER COLUMN "customerId" DROP NOT NULL;

ALTER TABLE "Order"
ADD CONSTRAINT "Order_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Ensure AuditAction enum includes customer account deletion.
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'CUSTOMER_ACCOUNT_DELETED';
