import { IsUUID, IsInt, Min, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddCartItemDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  outletId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  forceReplace?: boolean; // 🔥 ADD THIS
}
