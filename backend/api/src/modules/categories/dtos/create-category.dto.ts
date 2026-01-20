import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @Type(() => Number) // 🔥 THIS IS THE FIX
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
