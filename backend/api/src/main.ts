// src/main.ts

import * as fs from 'fs';
import * as path from 'path';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import cookieParser from 'cookie-parser';
import * as express from 'express';

import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

async function bootstrap() {
  /* -------------------------------------------------- */
  /* HTTPS (mkcert)                                     */
  /* -------------------------------------------------- */

const repoRoot =
  process.env.APP_ROOT ??
  path.resolve(__dirname, '..', '..', '..');

if (!process.env.APP_ROOT) {
  console.warn(
    '⚠️ APP_ROOT not set, using fallback:',
    repoRoot,
  );
}


  const httpsOptions = {
    key: fs.readFileSync(
      path.join(repoRoot, 'certs', 'admin.dev.local+1-key.pem'),
    ),
    cert: fs.readFileSync(
      path.join(repoRoot, 'certs', 'admin.dev.local+1.pem'),
    ),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  /* 🔥 THIS LINE FIXES REAL-TIME */
  app.useWebSocketAdapter(new IoAdapter(app));

  /* -------------------------------------------------- */
  /* GLOBAL REQUEST LOGGER                              */
  /* -------------------------------------------------- */
  app.use(new RequestLoggerMiddleware().use);

  /* -------------------------------------------------- */
  /* STATIC FILES                                       */
  /* -------------------------------------------------- */
  app.use(
    '/images',
    express.static(path.join(repoRoot, 'images')),
  );

  /* -------------------------------------------------- */
  /* GLOBAL FILTERS / INTERCEPTORS                      */
  /* -------------------------------------------------- */
  app.useGlobalFilters(new DomainExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  /* -------------------------------------------------- */
  /* TRUST PROXY                                       */
  /* -------------------------------------------------- */
  const server = app.getHttpAdapter().getInstance();
  server.set('trust proxy', 1);

  /* -------------------------------------------------- */
  /* COOKIES                                           */
  /* -------------------------------------------------- */
  app.use(cookieParser());

  /* -------------------------------------------------- */
  /* CORS                                              */
  /* -------------------------------------------------- */
  app.enableCors({
    origin: true,
    credentials: true,
  });

  /* -------------------------------------------------- */
  /* VALIDATION                                        */
  /* -------------------------------------------------- */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /* -------------------------------------------------- */
  /* START                                             */
  /* -------------------------------------------------- */
  const port = Number(process.env.APP_PORT) || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API running on https://admin.dev.local:${port}`);
}

bootstrap();
