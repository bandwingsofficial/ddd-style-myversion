// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';
// import { authenticator } from 'otplib';

// const prisma = new PrismaClient();

// async function main() {
//   const email = 'superadmin@demo.com';
//   const password = 'Super@123';

//   const passwordHash = await bcrypt.hash(password, 12);

//   // Generate TOTP secret (Base32, compatible with otplib)
//   const totpSecret = authenticator.generateSecret();

//   await prisma.superAdmin.upsert({
//     where: { email },
//     update: {},
//     create: {
//       email,
//       passwordHash,
//       totpSecret,
//       mfaEnabled: true,
//       isActive: true,
//     },
//   });

//   console.log('✅ Super admin seeded');
//   console.log(`📧 Email: ${email}`);
//   console.log(`🔑 Password: ${password}`);
//   console.log('🔐 TOTP Secret (add to Google Authenticator / Authy):');
//   console.log(totpSecret);
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seed failed', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'outletadmin@demo.com';
  const password = 'Outlet@123';

  const passwordHash = await bcrypt.hash(password, 12);

  /**
   * 1️⃣ Create or fetch outlet
   */
  const outlet = await prisma.outlet.upsert({
    where: { id: 'outlet_demo_001' },
    update: {},
    create: {
      id: 'outlet_demo_001',
      name: 'Demo Outlet',
    },
  });

  /**
   * 2️⃣ Create outlet admin user
   */
  await prisma.outletUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      outletId: outlet.id,
      isActive: true,
    },
  });

  console.log('✅ Outlet seeded:', outlet.name);
  console.log('✅ Outlet admin seeded');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

