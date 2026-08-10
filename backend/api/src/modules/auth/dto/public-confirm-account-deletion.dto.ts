import { IsString, MinLength, MaxLength } from 'class-validator';

export class PublicConfirmAccountDeletionDto {
  @IsString()
  phone: string;

  @IsString()
  @MinLength(4)
  @MaxLength(8)
  otp: string;
}
