// src/config/configuration.ts

export default () => ({
  app: {
    env: process.env.NODE_ENV,
    port: Number(process.env.PORT),
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: Number(process.env.JWT_ACCESS_TTL),
    refreshTtl: Number(process.env.JWT_REFRESH_TTL),
  },

  otp: {
    ttlSeconds: Number(process.env.OTP_TTL_SECONDS),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS),
  },
});
