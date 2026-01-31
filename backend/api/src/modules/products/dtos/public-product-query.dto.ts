import {
  IsOptional,
  IsUUID,
  IsString,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';

export class PublicProductQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  trending?: boolean;

  /* 🔥 ADD THESE */

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
