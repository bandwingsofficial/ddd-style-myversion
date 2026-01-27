import { IsUUID, IsInt, Min } from 'class-validator';

export class AddCartItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  outletId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
