import { IsEnum, IsOptional, IsString } from 'class-validator';

import { Unit } from '../domain/enums/unit.enum';

export class UpdateStockItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Unit)
  unit?: Unit;
}
