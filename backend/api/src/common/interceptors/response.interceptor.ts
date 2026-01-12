import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        /**
         * Interceptor MUST NOT guess.
         * Controller must return { code, message, data }
         */
        if (!data || typeof data !== 'object') {
          return data;
        }

        if (!('code' in data) || !('message' in data)) {
          return data;
        }

        return {
          success: true,
          code: data.code,
          message: data.message,
          data: data.data ?? null,
        };
      }),
    );
  }
}