import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

import { Unit } from '../../stock-items/domain/enums/unit.enum';

export class InitializeInventoryDto {
  @IsString()
  @IsNotEmpty()
  stockItemId: string;

  @IsEnum(Unit)
  unit: Unit;

  @IsNumber()
  @IsPositive()
  quantity: number;
}
