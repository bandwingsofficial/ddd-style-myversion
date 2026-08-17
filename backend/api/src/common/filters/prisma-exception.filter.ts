import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

type PrismaCaughtError =
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientValidationError
  | Prisma.PrismaClientUnknownRequestError;

function isEnumOrSchemaMismatch(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('invalid input value for enum') ||
    normalized.includes('operator does not exist') ||
    normalized.includes('column') && normalized.includes('does not exist')
  );
}

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
  Prisma.PrismaClientUnknownRequestError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaCaughtError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    this.logger.error(
      `Prisma error on ${request.method} ${request.url}: ${exception.message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (
        exception.code === 'P2022' ||
        exception.code === 'P2007' ||
        isEnumOrSchemaMismatch(exception.message)
      ) {
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          code: 'DATABASE_SCHEMA_MISMATCH',
          message:
            'Database schema is out of date. Run pending migrations and restart the API.',
        });
      }

      if (exception.code === 'P2002') {
        return response.status(HttpStatus.CONFLICT).json({
          success: false,
          code: 'DUPLICATE_RECORD',
          message: 'A record with the same unique value already exists.',
        });
      }

      if (exception.code === 'P2025') {
        return response.status(HttpStatus.NOT_FOUND).json({
          success: false,
          code: 'RECORD_NOT_FOUND',
          message: 'The requested record was not found.',
        });
      }
    }

    if (
      exception instanceof Prisma.PrismaClientUnknownRequestError &&
      isEnumOrSchemaMismatch(exception.message)
    ) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        code: 'DATABASE_SCHEMA_MISMATCH',
        message:
          'Database schema is out of date. Run pending migrations and restart the API.',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      code: 'DATABASE_ERROR',
      message: 'A database error occurred while processing the request.',
    });
  }
}
