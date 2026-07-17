import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ProductVariantDto } from "./product-variant.dto";
import { ProductImageDto } from "./product-image.dto";

export class CreateProductDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(140)
  slug!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsInt()
  @Min(1)
  priceCents!: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsInt()
  @Min(1)
  categoryId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  swatch?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants!: ProductVariantDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images!: ProductImageDto[];
}
