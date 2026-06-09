import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { QueryBaseDto } from "src/common/constants/interface";
import { ToBoolean, ToNumber } from "src/common/decorators/transform.decorator";

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
    example: 1,
    description: "media.id sau khi upload logo",
  })
  @IsInt()
  @Min(1)
  @ToNumber()
  logoMediaId: number;

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
