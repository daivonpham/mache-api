import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { ToNumber } from "src/common/decorators/transform.decorator";

export class AccountSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  search: string;

  @ApiPropertyOptional()
  @IsOptional()
  searchBy: string[];

  @ApiPropertyOptional()
  @IsOptional()
  sortBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  sort: "ASC" | "DESC";

  @ApiPropertyOptional()
  @IsOptional()
  fromDate: Date | string;

  @ApiPropertyOptional()
  @IsOptional()
  toDate: Date | string;

  @ApiPropertyOptional()
  @IsOptional()
  dateColumn: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  limit: number;

  @ApiPropertyOptional()
  @IsOptional()
  relations: string[];
}

import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class CreateAccountDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character",
    },
  )
  password: string;
}

export class CreateProfileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
