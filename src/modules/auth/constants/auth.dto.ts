import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsString, MinLength, ValidateNested } from "class-validator";
import {
  CreateAccountDto,
  CreateProfileDto,
} from "src/modules/user/constants/account.dto";

export class CreateUserDto {
  @ApiProperty()
  @Type(() => CreateAccountDto)
  @ValidateNested()
  account: CreateAccountDto;

  @ApiProperty()
  @Type(() => CreateProfileDto)
  @ValidateNested()
  profile: CreateProfileDto;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  oldPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  confirmNewPassword: string;
}
