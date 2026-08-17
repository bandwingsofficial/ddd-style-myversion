-- Add READY_TO_DISPATCH to order lifecycle enums (preserves existing values).
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'READY_TO_DISPATCH';
ALTER TYPE "OrderEventType" ADD VALUE IF NOT EXISTS 'READY_TO_DISPATCH';
