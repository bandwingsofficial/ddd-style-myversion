// src/modules/auth/dto/super-admin-mfa.dto.ts
import { IsString, MinLength } from 'class-validator';

export class SuperAdminMfaDto {
  @IsString()
  challengeId: string;

  @IsString()
  @MinLength(6)
  code: string;
}
