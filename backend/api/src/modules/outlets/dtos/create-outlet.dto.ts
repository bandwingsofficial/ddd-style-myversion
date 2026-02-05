// // src/modules/outlets/dtos/create-outlet.dto.ts

// import {
//   IsBoolean,
//   IsNotEmpty,
//   IsNumber,
//   IsOptional,
//   IsString,
//   Min,
// } from 'class-validator';

// export class CreateOutletDto {
//   @IsString()
//   @IsNotEmpty()
//   name: string;

//   @IsOptional()
//   @IsString()
//   branch?: string;

//   @IsOptional()
//   @IsNumber()
//   latitude?: number;

//   @IsOptional()
//   @IsNumber()
//   longitude?: number;

//   @IsOptional()
//   @IsNumber()
//   @Min(0.1)
//   deliveryRadiusKm?: number;

//   @IsOptional()
//   @IsBoolean()
//   isCentral?: boolean;

//   /**
//    * Admin-only
//    * Enables camera hardware (NOT streaming)
//    */
//   @IsOptional()
//   @IsBoolean()
//   cameraEnabled?: boolean;

//   @IsOptional()
//   @IsString()
//   address?: string;

//   @IsOptional()
//   @IsString()
//   pincode?: string;
//   @IsOptional()
//   @IsString()
//   location?: string;
// }

import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateOutletDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  deliveryRadiusKm?: number;

  @IsOptional()
  @IsBoolean()
  isCentral?: boolean;

  @IsOptional()
  @IsBoolean()
  cameraEnabled?: boolean;

  @IsOptional()
  @IsString()
  cameraStreamUrl?: string;
}

