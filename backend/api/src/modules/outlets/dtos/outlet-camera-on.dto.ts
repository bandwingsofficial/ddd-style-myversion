// src/modules/outlets/dtos/outlet-camera-on.dto.ts

import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class OutletCameraOnDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(rtsp|rtsps|http|https):\/\/.+$/, {
    message: 'streamUrl must be a valid camera stream URL (rtsp/http)',
  })
  streamUrl: string;
}
