import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class AdjustInventoryStockDto {
  @IsString()
  @IsNotEmpty()
  stockItemId: string;

  @IsNumber()
  @IsPositive()
  newAvailableQty: number;

  @IsString()
  @IsNotEmpty()
  remarks: string;
}
