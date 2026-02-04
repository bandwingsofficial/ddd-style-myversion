import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { ActorType } from '../../modules/auth/domain/enums/actor-type.enum';
import { SessionService } from '../../modules/auth/services/session.service';
import { AuthPayload } from '../../modules/auth/types/auth-payload.type';
import { OutletUserRepository } from '../../modules/outlets/repositories/outlet-user.repository';

/**
 * ✅ Extract JWT from HttpOnly cookie (WEB)
 * ✅ Fallback to Authorization header (Postman / Mobile)
 */
const cookieExtractor = (req: Request): string | null => {
  if (req?.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly sessionService: SessionService,
    private readonly outletUserRepo: OutletUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor, // ✅ WEB (HttpOnly cookie)
        ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ Postman / Mobile
      ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AuthPayload) {
    const session = await this.sessionService.findActiveSession({
      sessionId: payload.sid,
      actorId: payload.sub,
      actorType: payload.at,
      tokenVersion: payload.tv,
    });

    if (!session) {
      throw new UnauthorizedException('SESSION_INVALID');
    }

    let outletId: string | undefined;

    if (payload.at === ActorType.OUTLET_USER) {
      const outletUser = await this.outletUserRepo.findById(payload.sub);
      outletId = outletUser?.outletId;
    }

    /**
     * ✅ This object becomes `user` in JwtAuthGuard
     */
    return {
      actorId: payload.sub,
      actorType: payload.at,
      sessionId: payload.sid,
      tokenVersion: payload.tv,
      outletId,
      kind: 'access',
    };
  }
}
// jwt-strategy.ts