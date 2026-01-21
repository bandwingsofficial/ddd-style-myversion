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
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

/* DOMAIN ENUMS */
import { UnitType } from '../domain/enums/unit-type.enum';
import { ProductTag } from '../domain/enums/product-tag.enum';

export class CreateProductDto {
  /* ================================================= */
  /* RELATIONS                                        */
  /* ================================================= */

  @IsUUID()
  stockItemId: string;

  @IsUUID()
  categoryId: string;

  /* ================================================= */
  /* IDENTITY                                         */
  /* ================================================= */

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  productName: string;

  /* ================================================= */
  /* PRICING                                          */
  /* ================================================= */

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  originalPrice: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  discountPrice?: number;

  /* ================================================= */
  /* IMAGES                                           */
  /* (FILES — handled by multer, NOT validated here)  */
  /* ================================================= */

  // ❌ DO NOT DEFINE mainImage here
  // ❌ DO NOT DEFINE galleryImages here
  // multer provides them via @UploadedFiles()

  /* ================================================= */
  /* DESCRIPTIONS                                     */
  /* ================================================= */

  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  /* ================================================= */
  /* UNIT                                             */
  /* ================================================= */

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  unitValue: number;

  @IsEnum(UnitType)
  unitType: UnitType;

  /* ================================================= */
  /* TAGS                                             */
  /* ================================================= */

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(ProductTag, { each: true })
  tags?: ProductTag[];

  /* ================================================= */
  /* FLAGS                                            */
  /* ================================================= */

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isTrending?: boolean;
}
