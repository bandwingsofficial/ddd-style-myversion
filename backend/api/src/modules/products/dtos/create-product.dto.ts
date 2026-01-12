import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ArrayMaxSize,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @IsUUID()
  stockItemId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  productName: string;

  @IsNumber()
  @Min(0.01)
  originalPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  discountPrice?: number;

  @IsString()
  @IsNotEmpty()
  mainImage: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @IsString({ each: true })
  galleryImages?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsBoolean()
  isTrending?: boolean;
}
