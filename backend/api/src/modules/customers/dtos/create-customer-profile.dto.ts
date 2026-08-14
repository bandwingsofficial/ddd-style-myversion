import {
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateCustomerProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!:string;
  
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
