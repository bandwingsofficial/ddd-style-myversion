// src/config/config.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validateEnv } from './validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      load: [configuration],
      validate: validateEnv,
    }),
  ],
})
export class AppConfigModule {}
