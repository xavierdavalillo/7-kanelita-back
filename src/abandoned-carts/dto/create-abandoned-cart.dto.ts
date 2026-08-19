import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { AbandonedCartItemDto } from "./abandoned-cart-item.dto";

export class CreateAbandonedCartDto {
  @IsString()
  @MaxLength(80)
  cartToken!: string;

  @IsString()
  @MaxLength(120)
  customerName!: string;

  @IsString()
  @MaxLength(32)
  customerWhatsapp!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  customerEmail?: string;

  @IsString()
  @MaxLength(80)
  deliveryType!: string;

  @IsBoolean()
  consentToContact!: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AbandonedCartItemDto)
  items!: AbandonedCartItemDto[];
}
