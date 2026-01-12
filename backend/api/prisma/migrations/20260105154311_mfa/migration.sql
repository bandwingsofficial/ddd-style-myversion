/*
  Warnings:

  - The values [DELIVERY] on the enum `ActorType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActorType_new" AS ENUM ('CUSTOMER', 'DELIVERY_PARTNER', 'OUTLET_USER', 'SUPER_ADMIN');
ALTER TABLE "AuthSession" ALTER COLUMN "actorType" TYPE "ActorType_new" USING ("actorType"::text::"ActorType_new");
ALTER TABLE "OtpRequest" ALTER COLUMN "actorType" TYPE "ActorType_new" USING ("actorType"::text::"ActorType_new");
ALTER TABLE "MfaChallenge" ALTER COLUMN "actorType" TYPE "ActorType_new" USING ("actorType"::text::"ActorType_new");
ALTER TABLE "AuditLog" ALTER COLUMN "actorType" TYPE "ActorType_new" USING ("actorType"::text::"ActorType_new");
ALTER TYPE "ActorType" RENAME TO "ActorType_old";
ALTER TYPE "ActorType_new" RENAME TO "ActorType";
DROP TYPE "ActorType_old";
COMMIT;
