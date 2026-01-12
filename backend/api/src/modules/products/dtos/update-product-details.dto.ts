import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateProductDetailsDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  productName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;
}
