import { IsEnum } from 'class-validator';

import { Unit } from '../domain/enums/unit.enum';

export class ChangeStockItemUnitDto {
  @IsEnum(Unit)
  unit: Unit;
}
