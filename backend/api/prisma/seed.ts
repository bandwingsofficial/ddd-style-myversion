import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@demo.com';
  const password = 'Super@123';

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Generate TOTP secret (Base32)
  const totpSecret = authenticator.generateSecret();

  await prisma.superAdmin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      totpSecret,
      mfaEnabled: true,
      isActive: true,
    },
  });

  console.log('✅ Super Admin seeded successfully');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log('🔐 TOTP Secret (Add to Google Authenticator/Authy):');
  console.log(totpSecret);
}

main()
  .catch((error) => {
    console.error('❌ Super Admin seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
