import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnhandledExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return response
        .status(status)
        .json(
          typeof body === 'string'
            ? { statusCode: status, message: body }
            : body,
        );
    }

    const message =
      exception instanceof Error ? exception.message : String(exception);
    const stack = exception instanceof Error ? exception.stack : undefined;

    const context: Record<string, string> = {
      method: request.method,
      path: request.url,
    };

    if (request.url.includes('/admin/dashboard')) {
      const query = request.query as Record<string, unknown>;
      if (typeof query.period === 'string') {
        context.period = query.period;
      }
      if (typeof query.startDate === 'string') {
        context.startDate = query.startDate;
      }
      if (typeof query.endDate === 'string') {
        context.endDate = query.endDate;
      }
      if (typeof query.orderStatus === 'string') {
        context.orderStatus = query.orderStatus;
      }
      if (typeof query.paymentStatus === 'string') {
        context.paymentStatus = query.paymentStatus;
      }
    }

    this.logger.error(
      `Unhandled error on ${request.method} ${request.url}: ${message}`,
      stack,
      context,
    );

    if (response.headersSent) {
      return;
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
