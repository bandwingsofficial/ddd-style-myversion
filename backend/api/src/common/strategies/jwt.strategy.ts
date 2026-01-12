import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ActorType } from '../../modules/auth/domain/enums/actor-type.enum';
import { SessionService } from '../../modules/auth/services/session.service';
import { AuthPayload } from '../../modules/auth/types/auth-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly sessionService: SessionService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          const token = req?.cookies?.accessToken;

          console.log('🔑 [JWT STRATEGY] extracting token');
          console.log('🔑 token present:', Boolean(token));

          return token;
        },
      ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: AuthPayload): Promise<{
    actorId: string;
    actorType: ActorType;
    sessionId: string;
    tokenVersion: number;
  }> {
    console.log('🔐 [JWT STRATEGY] validate called');
    console.log('🔐 payload:', payload);

    const session = await this.sessionService.findActiveSession({
      sessionId: payload.sid,
      actorId: payload.sub,
      actorType: payload.at,
      tokenVersion: payload.tv,
    });

    if (!session) {
      console.log('❌ [JWT STRATEGY] session INVALID');
      throw new UnauthorizedException('SESSION_INVALID');
    }

    console.log('✅ [JWT STRATEGY] session VALID');

    return {
      actorId: payload.sub,
      actorType: payload.at,
      sessionId: payload.sid,
      tokenVersion: payload.tv,
    };
  }
}
