import {
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateCustomerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @IsOptional()
  @IsDateString()
  dob?: string; // ISO string from client
}
