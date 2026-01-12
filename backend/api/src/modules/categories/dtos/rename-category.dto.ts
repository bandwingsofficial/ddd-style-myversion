import { IsNotEmpty, IsString } from 'class-validator';

export class RenameCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
