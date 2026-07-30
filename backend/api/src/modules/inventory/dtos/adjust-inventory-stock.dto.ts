import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

import { InventoryAdjustmentType } from '../domain/enums/inventory-adjustment-type.enum';

export class AdjustInventoryStockDto {
  @IsString()
  @IsNotEmpty()
  stockItemId: string;

  @IsEnum(InventoryAdjustmentType)
  adjustmentType: InventoryAdjustmentType;

  @IsNumber()
  @IsPositive()
  adjustmentQuantity: number;

  @IsString()
  @IsNotEmpty()
  remarks: string;
}
