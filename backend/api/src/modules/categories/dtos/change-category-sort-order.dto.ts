import { IsInt, Min } from 'class-validator';

export class ChangeCategorySortOrderDto {
  @IsInt()
  @Min(0)
  sortOrder: number;
}
