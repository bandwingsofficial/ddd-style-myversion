// src/modules/auth/dto/refresh-session.dto.ts
import { IsString, MinLength } from 'class-validator';

export class RefreshSessionDto {
  @IsString()
  @MinLength(1)
  refreshToken: string;
}
