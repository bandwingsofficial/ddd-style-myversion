import { JwtService } from '@nestjs/jwt';
import { ActorType } from '../../modules/auth/domain/enums/actor-type.enum';

export class JwtHelper {
  constructor(
    private readonly jwt: JwtService,
    private readonly secret: string,
    private readonly ttlSeconds: number,
  ) {}

  signAccessToken(params: {
    actorId: string;
    sessionId: string;
    actorType: ActorType;
    tokenVersion: number;
  }): string {
    return this.jwt.sign(
      {
        sub: params.actorId,
        sid: params.sessionId,
        at: params.actorType,
        tv: params.tokenVersion,
      },
      {
        secret: this.secret,
        expiresIn: this.ttlSeconds,
      },
    );
  }
}
