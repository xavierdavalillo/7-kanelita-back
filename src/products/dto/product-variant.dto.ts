import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class ProductVariantDto {
  @IsString()
  @MaxLength(40)
  size!: string;

  @IsInt()
  @Min(0)
  stock!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
