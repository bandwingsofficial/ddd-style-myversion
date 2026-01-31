import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ActorType } from '../../modules/auth/domain/enums/actor-type.enum';
import { SessionService } from '../../modules/auth/services/session.service';
import { AuthPayload } from '../../modules/auth/types/auth-payload.type';

import { OutletUserRepository } from '../../modules/outlets/repositories/outlet-user.repository'; // ⭐ use repo

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly sessionService: SessionService,
    private readonly outletUserRepo: OutletUserRepository, // ⭐ inject repo
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AuthPayload) {
    const session =
      await this.sessionService.findActiveSession({
        sessionId: payload.sid,
        actorId: payload.sub,
        actorType: payload.at,
        tokenVersion: payload.tv,
      });

    if (!session) {
      throw new UnauthorizedException('SESSION_INVALID');
    }

    /*
    🔥 Fetch outlet user to get outletId
    */

    let outletId: string | undefined;

    if (payload.at === ActorType.OUTLET_USER) {
      const outletUser =
        await this.outletUserRepo.findById(payload.sub);

      outletId = outletUser?.outletId;
    }

    return {
      actorId: payload.sub,
      actorType: payload.at,
      sessionId: payload.sid,
      tokenVersion: payload.tv,
      outletId, // ✅ now available in @CurrentUser()
      kind: 'access',
    };
  }
}
