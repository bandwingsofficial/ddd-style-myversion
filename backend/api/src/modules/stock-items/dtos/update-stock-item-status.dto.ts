import { IsEnum } from 'class-validator';

import { StockItemStatus } from '../domain/enums/stock-item-status.enum';

export class UpdateStockItemStatusDto {
  @IsEnum(StockItemStatus)
  status: StockItemStatus;
}
