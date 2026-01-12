import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    console.log('────────────────────────────────');
    console.log(`➡️  ${req.method} ${req.originalUrl}`);
    console.log('🍪 cookies:', req.headers.cookie || 'NONE');
    console.log('📦 body:', req.body || {});
    console.log('🧭 origin:', req.headers.origin);
    console.log('🧾 client:', req.headers['x-client-type']);

    res.on('finish', () => {
      console.log(
        `⬅️  ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`,
      );
      console.log('────────────────────────────────');
    });

    next();
  }
}
