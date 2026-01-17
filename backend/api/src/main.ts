// src/main.ts

/**
 * ============================================================
 * 🔐 LOCAL HTTPS SETUP (DO NOT REMOVE)
 * ============================================================
 *
 * REQUIRED COMMANDS (RUN ON HOST MACHINE):
 *
 * 1️⃣ Install mkcert (one time)
 *    https://github.com/FiloSottile/mkcert
 *
 * 2️⃣ Install local CA
 *    $ mkcert -install
 *
 * 3️⃣ Generate certificate (run from repo root)
 *    $ mkcert admin.dev.local
 *
 *    This will generate:
 *    - admin.dev.local+1.pem
 *    - admin.dev.local+1-key.pem
 *
 * 4️⃣ Move certs into:
 *    /certs
 *
 * 5️⃣ Add host mapping (HOST MACHINE):
 *    192.168.1.5 admin.dev.local
 *
 * 6️⃣ Android Emulator ONLY:
 *    $ adb root
 *    $ adb remount
 *    $ adb shell
 *    # echo "192.168.1.5 admin.dev.local" >> /system/etc/hosts
 *
 * 7️⃣ Install mkcert root CA on Android:
 *    $ adb push ~/.local/share/mkcert/rootCA.pem /sdcard/
 *
 *    Android Settings →
 *    Security → Install CA Certificate → VPN & apps
 *
 * API URL (Flutter):
 *    https://admin.dev.local:4000
 *
 * ⚠️ DO NOT USE IP WITH HTTPS
 * ❌ https://192.168.1.5:4000 (WILL FAIL TLS)
 * ============================================================
 */

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
    origin: true,
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

  // MUST be 0.0.0.0 for LAN / Android access
  await app.listen(port, '0.0.0.0');

  console.log(
    `🚀 API running on https://api.dev.local:${port}`,
  );
}

bootstrap();
