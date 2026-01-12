// src/main.ts

import * as fs from 'fs';
import * as path from 'path';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { DomainExceptionFilter } from './common/filters/domain-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

async function bootstrap() {
  /* -------------------------------------------------- */
  /* HTTPS (mkcert)                                     */
  /* -------------------------------------------------- */

  const repoRoot = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
  );

  const httpsOptions = {
    key: fs.readFileSync(
      path.join(
        repoRoot,
        'certs',
        'admin.dev.local+1-key.pem',
      ),
    ),
    cert: fs.readFileSync(
      path.join(
        repoRoot,
        'certs',
        'admin.dev.local+1.pem',
      ),
    ),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  /* -------------------------------------------------- */
  /* 🔥 GLOBAL REQUEST LOGGER (DEBUG)                   */
  /* -------------------------------------------------- */
  app.use(new RequestLoggerMiddleware().use);

  /* -------------------------------------------------- */
  /* GLOBAL DOMAIN ERRORS                               */
  /* -------------------------------------------------- */
  app.useGlobalFilters(new DomainExceptionFilter());

  /* -------------------------------------------------- */
  /* GLOBAL RESPONSE WRAPPER                            */
  /* -------------------------------------------------- */
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
    origin: ['https://admin.dev.local:3001','https://outlets.dev.local:3000'],
    credentials: true,
  });

  /* -------------------------------------------------- */
  /* GLOBAL VALIDATION                                  */
  /* -------------------------------------------------- */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /* -------------------------------------------------- */
  /* START SERVER                                       */
  /* -------------------------------------------------- */
  const port = Number(process.env.APP_PORT) || 4000;
  await app.listen(port);

  console.log(
    `🚀 API running on https://api.dev.local:${port}`,
  );
}

bootstrap();
