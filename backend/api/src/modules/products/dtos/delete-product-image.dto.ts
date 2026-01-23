import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteProductImageDto {
  @IsString()
  @IsNotEmpty()
  imagePath: string; // images/products/xxx.jpg
}
