import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    console.log('🛡️ [JWT GUARD] canActivate');
    console.log('🛡️ path:', req.method, req.originalUrl);
    console.log('🛡️ cookies:', req.headers.cookie || 'NONE');

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      console.log('🛡️ route is PUBLIC — skipping auth');
      return true;
    }

    console.log('🛡️ route is PROTECTED — validating JWT');
    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ) {
    const req = context.switchToHttp().getRequest();

    console.log('🛡️ [JWT GUARD] handleRequest');
    console.log('🛡️ error:', err?.message || 'NONE');
    console.log('🛡️ info:', info?.name || info || 'NONE');
    console.log('🛡️ user:', user || 'NONE');

    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        console.log('❌ TOKEN EXPIRED');
        throw new UnauthorizedException('TOKEN_EXPIRED');
      }

      if (info instanceof JsonWebTokenError) {
        console.log('❌ INVALID TOKEN');
        throw new UnauthorizedException('INVALID_TOKEN');
      }

      console.log('❌ UNAUTHORIZED — no user context');
      throw new UnauthorizedException('UNAUTHORIZED');
    }

    /**
     * ✅ ACCESS TOKEN AUTH CONTEXT
     */
    req.auth = {
  ...user,
};

    console.log('✅ JWT VALID — auth context attached');
    console.log('✅ req.auth:', req.auth);

    return user;
  }
}
