import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { Unit } from '../domain/enums/unit.enum';

export class CreateStockItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Unit)
  unit: Unit;
}
