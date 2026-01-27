import { IsOptional, IsString } from 'class-validator';

export class PaymentWebhookDto {
  payload: unknown;

  @IsOptional()
  @IsString()
  signature?: string;
}
