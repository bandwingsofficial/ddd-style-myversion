// src/modules/auth/dto/super-admin-login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SuperAdminLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
