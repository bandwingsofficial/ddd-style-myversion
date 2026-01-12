import { IsNotEmpty, IsString } from 'class-validator';

export class RenameStockItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
