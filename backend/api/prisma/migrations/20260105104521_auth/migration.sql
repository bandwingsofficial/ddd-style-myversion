/*
  Warnings:

  - The values [SUPERADMIN] on the enum `ActorType` will be removed. If these variants are still used in the database, this will fail.
  - The values [OTP_FAILED,TOKEN_REFRESH,SUPERADMIN_ACTION] on the enum `AuditAction` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActorType_new" AS ENUM ('CUSTOMER', 'DELIVERY', 'OUTLET_USER', 'SUPER_ADMIN');
ALTER TABLE "AuthSession" ALTER COLUMN "actorType" TYPE "ActorType_new" USING ("actorType"::text::"ActorType_new");
ALTER TABLE "OtpRequest" ALTER COLUMN "actorType" TYPE "ActorType_new" USING ("actorType"::text::"ActorType_new");
ALTER TABLE "AuditLog" ALTER COLUMN "actorType" TYPE "ActorType_new" USING ("actorType"::text::"ActorType_new");
ALTER TYPE "ActorType" RENAME TO "ActorType_old";
ALTER TYPE "ActorType_new" RENAME TO "ActorType";
DROP TYPE "ActorType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "AuditAction_new" AS ENUM ('OTP_REQUESTED', 'OTP_VERIFICATION_FAILED', 'OTP_VERIFIED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'MFA_FAILED', 'TOKEN_REFRESHED', 'TOKEN_REUSE_DETECTED', 'LOGOUT', 'LOGOUT_ALL', 'SESSION_REVOKED', 'DELIVERY_APPROVED', 'DELIVERY_REJECTED', 'DELIVERY_SUSPENDED', 'DELIVERY_BLOCKED', 'OUTLET_USER_CREATED', 'OUTLET_USER_DISABLED', 'SUPER_ADMIN_LOGIN', 'SUPER_ADMIN_ACTION');
ALTER TABLE "AuditLog" ALTER COLUMN "action" TYPE "AuditAction_new" USING ("action"::text::"AuditAction_new");
ALTER TYPE "AuditAction" RENAME TO "AuditAction_old";
ALTER TYPE "AuditAction_new" RENAME TO "AuditAction";
DROP TYPE "AuditAction_old";
COMMIT;

-- AlterEnum
ALTER TYPE "DeliveryStatus" ADD VALUE 'REJECTED';

-- AlterEnum
ALTER TYPE "OtpPurpose" ADD VALUE 'SENSITIVE_ACTION';
