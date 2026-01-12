// src/modules/auth/services/auth-orchestrator.service.ts

import { Injectable } from '@nestjs/common';

import { ActorType } from '../domain/enums/actor-type.enum';
import { OtpPurpose } from '../domain/enums/otp-purpose.enum';

import { CredentialService } from './credential.service';
import { IdentityService } from './identity.service';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

import { MfaChallengeRepository } from '../repositories/mfa-challenge.repository';

import { UnauthorizedError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';

import { AuthContext } from '../types/actor-context.type';

@Injectable()
export class AuthOrchestratorService {
  constructor(
    private readonly otpService: OtpService,
    private readonly identityService: IdentityService,
    private readonly credentialService: CredentialService,
    private readonly sessionService: SessionService,
    private readonly tokenService: TokenService,
    private readonly mfaRepo: MfaChallengeRepository,
  ) {}

  /* ================================================= */
  /* OTP REQUEST                                      */
  /* ================================================= */

  async requestOtp(params: {
    actorType: ActorType;
    phone: string;
    purpose: OtpPurpose;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.otpService.requestOtp(params);
  }

  /* ================================================= */
  /* OTP LOGIN (CUSTOMER / DELIVERY)                   */
  /* ================================================= */

  async loginWithOtp(params: {
    actorType: ActorType;
    phone: string;
    otp: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthContext> {
    if (
      params.actorType !== ActorType.CUSTOMER &&
      params.actorType !== ActorType.DELIVERY
    ) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    await this.otpService.verifyOtp({
      actorType: params.actorType,
      phone: params.phone,
      purpose: OtpPurpose.LOGIN,
      otp: params.otp,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const identity = await this.identityService.resolveByPhone({
      actorType: params.actorType,
      phone: params.phone,
      autoCreate: params.actorType === ActorType.CUSTOMER,
    });

    if (!identity?.actorId) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    const session = await this.sessionService.createSession({
      actorType: params.actorType,
      actorId: identity.actorId,
      deviceId: params.deviceId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const tokens = await this.tokenService.issueTokens({
      actorType: params.actorType,
      actorId: identity.actorId,
      sessionId: session.id,
      tokenVersion: identity.tokenVersion,
    });

    return {
      actorType: params.actorType,
      actorId: identity.actorId,
      sessionId: session.id,
      tokenVersion: identity.tokenVersion,
      roles: [params.actorType],

      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,

      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    };
  }

  /* ================================================= */
  /* PASSWORD LOGIN (OUTLET USER)                      */
  /* ================================================= */

  async loginWithPassword(params: {
    actorType: ActorType.OUTLET_USER;
    email: string;
    password: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthContext> {
    const identity = await this.identityService.resolveByEmail({
      actorType: ActorType.OUTLET_USER,
      email: params.email,
    });

    if (!identity?.actorId) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    await this.credentialService.verifyPassword({
      actorType: ActorType.OUTLET_USER,
      actorId: identity.actorId,
      password: params.password,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const session = await this.sessionService.createSession({
      actorType: ActorType.OUTLET_USER,
      actorId: identity.actorId,
      deviceId: params.deviceId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const tokens = await this.tokenService.issueTokens({
      actorType: ActorType.OUTLET_USER,
      actorId: identity.actorId,
      sessionId: session.id,
      tokenVersion: identity.tokenVersion,
    });

    return {
      actorType: ActorType.OUTLET_USER,
      actorId: identity.actorId,
      sessionId: session.id,
      tokenVersion: identity.tokenVersion,
      roles: [ActorType.OUTLET_USER],

      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,

      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    };
  }

  /* ================================================= */
  /* SUPER ADMIN – STEP 1 (PASSWORD → MFA)             */
  /* ================================================= */

  async startSuperAdminLogin(params: {
    email: string;
    password: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ challengeId: string }> {
    const identity = await this.identityService.resolveByEmail({
      actorType: ActorType.SUPER_ADMIN,
      email: params.email,
    });

    if (!identity?.actorId) {
      throw new UnauthorizedError(
        AuthErrors.INVALID_CREDENTIALS,
        'Invalid credentials',
      );
    }

    await this.credentialService.verifyPassword({
      actorType: ActorType.SUPER_ADMIN,
      actorId: identity.actorId,
      password: params.password,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const challenge = await this.mfaRepo.create({
      actorType: ActorType.SUPER_ADMIN,
      actorId: identity.actorId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return { challengeId: challenge.id };
  }

  /* ================================================= */
  /* SUPER ADMIN – STEP 2 (MFA → LOGIN)                */
  /* ================================================= */

  async verifySuperAdminMfa(params: {
    challengeId: string;
    code: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthContext> {
    const challenge = await this.mfaRepo.findById(params.challengeId);

    if (!challenge) {
      throw new UnauthorizedError(
        AuthErrors.MFA_INVALID,
        'Invalid MFA code',
      );
    }

    challenge.assertCanVerify();

    await this.credentialService.verifyTotp({
      actorType: ActorType.SUPER_ADMIN,
      actorId: challenge.actorId,
      code: params.code,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    await this.mfaRepo.markVerified(challenge.id);

    const identity = await this.identityService.resolveById({
      actorType: ActorType.SUPER_ADMIN,
      actorId: challenge.actorId,
    });

    const session = await this.sessionService.createSession({
      actorType: ActorType.SUPER_ADMIN,
      actorId: challenge.actorId,
      deviceId: params.deviceId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const tokens = await this.tokenService.issueTokens({
      actorType: ActorType.SUPER_ADMIN,
      actorId: challenge.actorId,
      sessionId: session.id,
      tokenVersion: identity.tokenVersion,
    });

    return {
      actorType: ActorType.SUPER_ADMIN,
      actorId: challenge.actorId,
      sessionId: session.id,
      tokenVersion: identity.tokenVersion,
      roles: [ActorType.SUPER_ADMIN],

      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,

      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    };
  }

  /* ================================================= */
  /* REFRESH / LOGOUT                                 */
  /* ================================================= */

  async refreshSession(params: {
    actorType: ActorType;
    actorId: string;
    sessionId: string; // NOT trusted – kept only for interface compatibility
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthContext> {
    const identity = await this.identityService.resolveById({
      actorType: params.actorType,
      actorId: params.actorId,
    });

    /**
     * 🔐 Refresh token ownership + session validity
     * is already enforced by:
     * - RefreshTokenGuard
     * - RefreshTokenService
     * - TokenService.rotateRefreshToken
     */
    const tokens = await this.tokenService.rotateRefreshToken({
      refreshToken: params.refreshToken,
      tokenVersion: identity.tokenVersion,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return {
      actorType: params.actorType,
      actorId: params.actorId,
      sessionId: params.sessionId,
      tokenVersion: identity.tokenVersion,
      roles: [params.actorType],

      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,

      refreshToken: tokens.refreshToken,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    };
  }

  async logout(params: {
    sessionId: string;
    actorType: ActorType;
    actorId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.sessionService.revokeSession(params);
  }

  async logoutAll(params: {
    actorType: ActorType;
    actorId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ revokedCount: number }> {
    return this.sessionService.revokeAllSessions(params);
  }
}
