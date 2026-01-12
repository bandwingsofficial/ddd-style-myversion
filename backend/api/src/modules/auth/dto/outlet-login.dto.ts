// src/modules/auth/dto/outlet-login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class OutletLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
