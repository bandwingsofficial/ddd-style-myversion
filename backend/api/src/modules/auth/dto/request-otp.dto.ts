// src/modules/auth/dto/request-otp.dto.ts
import { IsString } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  phone: string;
}
