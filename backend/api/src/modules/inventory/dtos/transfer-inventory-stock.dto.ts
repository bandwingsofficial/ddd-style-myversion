import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class TransferInventoryStockDto {
  @IsString()
  @IsNotEmpty()
  stockItemId: string;

  @IsString()
  @IsNotEmpty()
  outletId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
