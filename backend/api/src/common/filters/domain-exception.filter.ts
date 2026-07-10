import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AppError } from '../errors/app-error';
import {
  ValidationError,
  InvariantViolationError,
} from '../errors/domain-errors';

@Catch(AppError, ValidationError, InvariantViolationError)
export class DomainExceptionFilter
  implements ExceptionFilter
{
  catch(
    exception:
      | AppError
      | ValidationError
      | InvariantViolationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    /* ================================================= */
    /* DEBUG LOGS                                        */
    /* ================================================= */

    console.error('\n================ DOMAIN EXCEPTION ================');
    console.error(`Path      : ${request.method} ${request.url}`);
    console.error(`Code      : ${exception.code}`);
    console.error(`Message   : ${exception.message}`);
    console.error('Metadata  :', exception.metadata ?? null);
    console.error('Exception :', exception);

    if (exception instanceof Error) {
      console.error('Stack:\n', exception.stack);
    }

    console.error('==================================================\n');

    /* ================================================= */
    /* STATUS CODE MAPPING                               */
    /* ================================================= */

    let status = HttpStatus.BAD_REQUEST;

    switch (exception.code) {
      /* ---------- AUTH / SECURITY ---------- */

      case 'UNAUTHORIZED':
      case 'INVALID_CREDENTIALS':
        status = HttpStatus.UNAUTHORIZED;
        break;

      case 'FORBIDDEN':
      case 'ACCOUNT_LOCKED':
      case 'OTP_BLOCKED':
        status = HttpStatus.FORBIDDEN;
        break;

      case 'OTP_ALREADY_SENT':
      case 'OTP_SEND_LIMIT_EXCEEDED':
        status = HttpStatus.TOO_MANY_REQUESTS;
        break;

      case 'OTP_EXPIRED':
        status = HttpStatus.GONE;
        break;

      /* ---------- OUTLET DOMAIN ---------- */

      case 'OUTLET_NOT_FOUND':
      case 'OUTLET_USER_NOT_FOUND':
        status = HttpStatus.NOT_FOUND;
        break;

      case 'OUTLET_USER_ALREADY_EXISTS':
        status = HttpStatus.CONFLICT;
        break;

      /* ---------- VALIDATION ---------- */

      case 'VALIDATION_ERROR':
      case 'INVARIANT_VIOLATION':
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;

      /* ---------- DEFAULT ---------- */

      default:
        status = HttpStatus.BAD_REQUEST;
    }

    /* ================================================= */
    /* RESPONSE                                          */
    /* ================================================= */

    return response.status(status).json({
      success: false,
      code: exception.code,
      message: exception.message,
      metadata: exception.metadata ?? null,
    });
  }
}