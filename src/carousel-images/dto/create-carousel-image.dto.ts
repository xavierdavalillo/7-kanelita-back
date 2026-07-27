import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateCarouselImageDto {
  @IsString()
  @MaxLength(180)
  publicId!: string;

  @IsString()
  @MaxLength(180)
  alt!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  trimDarkEdges?: boolean;
}
