import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { QueryBaseDto } from "src/common/constants/interface";
import { ToBoolean } from "src/common/decorators/transform.decorator";

export class CreateBrandDto {
  @ApiProperty({ example: "SMC" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: "smc" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: "Thương hiệu van khí nén Nhật Bản" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "/uploads/2025/05/abc.png",
    description: "URL logo (thường từ module media)",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  logo: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}

export class BrandQueryDto extends PickType(QueryBaseDto, [
  "page",
  "limit",
  "search",
]) {}
