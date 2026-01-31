// src/modules/auth/modules/auth.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

/* ================= CONTROLLERS ================= */

import { AuthOtpController } from '../controllers/otp.controller';
import { OutletAuthController } from '../controllers/outlet-auth.controller';
import { SessionController } from '../controllers/session.controller';
import { SuperAdminAuthController } from '../controllers/super-admin-auth.controller';

/* ================= SERVICES ================= */

import { AuthOrchestratorService } from '../services/auth-orchestrator.service';
import { CredentialService } from '../services/credential.service';
import { IdentityService } from '../services/identity.service';
import { OtpService } from '../services/otp.service';
import { RefreshTokenService } from '../services/refresh-token.service';
import { SessionService } from '../services/session.service';
import { TokenService } from '../services/token.service';

/* ================= STRATEGIES & GUARDS ================= */

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RefreshTokenGuard } from '../../../common/guards/refresh-token.guard';
import { JwtStrategy } from '../../../common/strategies/jwt.strategy';

/* ================= REPOSITORIES ================= */

import { CustomerRepository } from '../repositories/customer.repository';
import { DeliveryPartnerRepository } from '../repositories/delivery-partner.repository';
import { OutletUserRepository } from '../repositories/outlet-user.repository';
import { SuperAdminRepository } from '../repositories/super-admin.repository';

import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuthSessionRepository } from '../repositories/auth-session.repository';
import { MfaChallengeRepository } from '../repositories/mfa-challenge.repository';
import { OtpRequestRepository } from '../repositories/otp-request.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

/* ================= INFRASTRUCTURE ================= */

import { PrismaModule } from '../../../infrastructure/prisma/prisma.module';
import { RedisModule } from '../../../infrastructure/redis/redis.module';
import { QueueModule } from '../../../infrastructure/queue/queue.module';
import { OutletsModule } from '../../outlets/modules/outlets.module';

@Module({
  /* ================= IMPORTS ================= */

  imports: [
    PrismaModule,
    RedisModule,
    QueueModule, // ⭐ REQUIRED FOR QueueService (OTP async delivery)
    ConfigModule,
    OutletsModule,

    /* ---------- PASSPORT ---------- */
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    /* ---------- JWT (ASYNC, CONFIG-DRIVEN) ---------- */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: config.get<number>('jwt.accessTtl'),
        },
      }),
    }),
  ],

  /* ================= CONTROLLERS ================= */

  controllers: [
    AuthOtpController,
    OutletAuthController,
    SuperAdminAuthController,
    SessionController,
  ],

  /* ================= PROVIDERS ================= */

  providers: [
    /* ---- STRATEGIES & GUARDS ---- */
    JwtStrategy,
    JwtAuthGuard,
    RefreshTokenGuard,

    /* ---- ORCHESTRATOR ---- */
    AuthOrchestratorService,

    /* ---- SERVICES ---- */
    CredentialService,
    IdentityService,
    OtpService, // ✅ QueueService injected here
    SessionService,
    TokenService,
    RefreshTokenService,

    /* ---- REPOSITORIES ---- */
    CustomerRepository,
    DeliveryPartnerRepository,
    OutletUserRepository,
    SuperAdminRepository,

    AuthSessionRepository,
    RefreshTokenRepository,
    OtpRequestRepository,
    MfaChallengeRepository,
    AuditLogRepository,
  ],

  /* ================= EXPORTS ================= */

  exports: [
    AuthOrchestratorService,
    TokenService,
    JwtAuthGuard, // for global guard usage
  ],
})
export class AuthModule {}
