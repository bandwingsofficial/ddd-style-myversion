-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "fullName" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "gender" TEXT,
    "dob" TIMESTAMP(3),
    "referralCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutletProfile" (
    "id" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "ownerName" TEXT,
    "description" TEXT,
    "gstNumber" TEXT,
    "fssaiNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutletProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuperAdminProfile" (
    "id" TEXT NOT NULL,
    "superAdminId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "title" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuperAdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_customerId_key" ON "CustomerProfile"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_email_key" ON "CustomerProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_referralCode_key" ON "CustomerProfile"("referralCode");

-- CreateIndex
CREATE INDEX "CustomerProfile_customerId_idx" ON "CustomerProfile"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "OutletProfile_outletId_key" ON "OutletProfile"("outletId");

-- CreateIndex
CREATE INDEX "OutletProfile_outletId_idx" ON "OutletProfile"("outletId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdminProfile_superAdminId_key" ON "SuperAdminProfile"("superAdminId");

-- CreateIndex
CREATE INDEX "SuperAdminProfile_superAdminId_idx" ON "SuperAdminProfile"("superAdminId");

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutletProfile" ADD CONSTRAINT "OutletProfile_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuperAdminProfile" ADD CONSTRAINT "SuperAdminProfile_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "SuperAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
