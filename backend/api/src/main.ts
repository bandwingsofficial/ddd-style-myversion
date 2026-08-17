// src/main.ts

import * as path from 'path';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import cookieParser from 'cookie-parser';
import * as express from 'express';

import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { UnhandledExceptionFilter } from './common/filters/unhandled-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

async function bootstrap() {
  const repoRoot =
    process.env.APP_ROOT ?? path.resolve(__dirname, '..', '..', '..');

  if (!process.env.APP_ROOT) {
    console.warn('⚠️ APP_ROOT not set, using fallback:', repoRoot);
  }

  // Always use HTTP locally
  const app = await NestFactory.create(AppModule);

  /* -------------------------------------------------- */
  /* WEBSOCKET                                          */
  /* -------------------------------------------------- */

  app.useWebSocketAdapter(new IoAdapter(app));

  /* -------------------------------------------------- */
  /* REQUEST LOGGER                                     */
  /* -------------------------------------------------- */

  app.use(new RequestLoggerMiddleware().use);

  /* -------------------------------------------------- */
  /* STATIC FILES                                       */
  /* -------------------------------------------------- */

  app.use('/images', express.static(path.join(repoRoot, 'images')));

  /* -------------------------------------------------- */
  /* FILTERS / INTERCEPTORS                             */
  /* -------------------------------------------------- */

  app.useGlobalFilters(
    new UnhandledExceptionFilter(),
    new DomainExceptionFilter(),
    new PrismaExceptionFilter(),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());

  /* -------------------------------------------------- */
  /* TRUST PROXY                                        */
  /* -------------------------------------------------- */

  const server = app.getHttpAdapter().getInstance();
  server.set('trust proxy', 1);

  /* -------------------------------------------------- */
  /* COOKIES                                            */
  /* -------------------------------------------------- */

  app.use(cookieParser());

  /* -------------------------------------------------- */
  /* CORS                                               */
  /* -------------------------------------------------- */

  app.enableCors({
    origin: true,
    credentials: true,
  });

  /* -------------------------------------------------- */
  /* VALIDATION                                         */
  /* -------------------------------------------------- */

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /* -------------------------------------------------- */
  /* START                                              */
  /* -------------------------------------------------- */

  const port = Number(process.env.APP_PORT) || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API running on http://localhost:${port}`);
}

bootstrap();
