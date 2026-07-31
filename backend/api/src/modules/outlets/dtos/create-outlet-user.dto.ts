import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

import { OutletUserRole } from '../domain/enums/outlet-user-role.enum';

export class CreateOutletUserDto {
  @IsString()
  @IsNotEmpty()
  outletId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/, {
    message: 'Phone must be 7–20 digits and may include + - ( ) spaces',
  })
  phone?: string;

  @IsEnum(OutletUserRole)
  role: OutletUserRole;

  @IsString()
  @MinLength(8)
  password: string;
}
