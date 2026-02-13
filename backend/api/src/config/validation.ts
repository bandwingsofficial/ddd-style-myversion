// src/config/validation.ts

import { z } from 'zod';

export const envValidationSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().min(1),

  DATABASE_URL: z.string().url(),
  

  REDIS_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  JWT_ACCESS_TTL: z.coerce.number().min(60),
  JWT_REFRESH_TTL: z.coerce.number().min(60),

  OTP_TTL_SECONDS: z.coerce.number().min(30),
  OTP_MAX_ATTEMPTS: z.coerce.number().min(1).max(10),
});

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envValidationSchema.safeParse(config);

  if (!parsed.success) {
    console.error('❌ Invalid environment configuration');
    console.error(parsed.error.format());
    process.exit(1);
  }

  return parsed.data;
}
