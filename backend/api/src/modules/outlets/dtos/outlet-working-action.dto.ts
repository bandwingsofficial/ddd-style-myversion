// src/modules/outlets/dtos/outlet-working-action.dto.ts

import { IsEnum } from 'class-validator';
import { OutletWorkingStatus } from '../domain/enums/outlet-working-status.enum';

export class OutletWorkingActionDto {
  @IsEnum(OutletWorkingStatus)
  status: OutletWorkingStatus;
}
