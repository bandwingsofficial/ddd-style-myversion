import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class OutletCameraConfigDto {
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^(rtsp|rtsps|http|https):\/\/.+$/i, {
    message:
      'streamUrl must start with rtsp://, rtsps://, http://, or https://',
  })
  streamUrl?: string;
}
