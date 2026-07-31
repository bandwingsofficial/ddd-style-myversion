-- Add profile fields required by Outlet User management module.
ALTER TABLE "OutletUser" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT 'Outlet User';
ALTER TABLE "OutletUser" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "OutletUser" ADD COLUMN IF NOT EXISTS "role" "OutletUserRole" NOT NULL DEFAULT 'STAFF';

CREATE UNIQUE INDEX IF NOT EXISTS "OutletUser_phone_key" ON "OutletUser"("phone");
