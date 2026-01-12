// src/modules/outlets/dtos/outlet-camera-config.dto.ts

import { IsBoolean } from 'class-validator';

export class OutletCameraConfigDto {
  @IsBoolean()
  enabled: boolean;
}
