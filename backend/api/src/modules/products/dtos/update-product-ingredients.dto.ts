import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';


export class UpdateProductIngredientsDto {
  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  extraInfo1?: string;

  @IsOptional()
  @IsString()
  extraInfo2?: string;
}
