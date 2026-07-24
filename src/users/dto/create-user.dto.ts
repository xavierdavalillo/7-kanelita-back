import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(80)
  password!: string;

  @IsInt()
  @Min(1)
  roleId!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
