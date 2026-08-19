import { IsInt, IsString, MaxLength, Min } from "class-validator";

export class AbandonedCartItemDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsString()
  @MaxLength(160)
  title!: string;

  @IsString()
  @MaxLength(40)
  selectedSize!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsInt()
  @Min(0)
  priceCents!: number;

  @IsString()
  @MaxLength(8)
  currency!: string;
}
