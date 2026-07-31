import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { OutletUserRole } from '../domain/enums/outlet-user-role.enum';

export class UpdateOutletUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/, {
    message: 'Phone must be 7–20 digits and may include + - ( ) spaces',
  })
  phone?: string;

  @IsEnum(OutletUserRole)
  role: OutletUserRole;

  @IsString()
  @IsNotEmpty()
  outletId: string;
}
