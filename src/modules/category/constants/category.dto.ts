import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";
import { QueryBaseDto } from "src/common/constants/interface";
import { ToBoolean, ToNumber } from "src/common/decorators/transform.decorator";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateCategoryDto {
  @ApiProperty({ example: "Van điện từ" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: "van-dien-tu" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(SLUG_PATTERN, {
    message: "Slug chỉ được dùng chữ thường, số và dấu gạch ngang",
  })
  slug: string;

  @ApiPropertyOptional({ example: "Danh mục van solenoid công nghiệp" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: "valve",
    description: "Icon danh mục (class name hoặc key)",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon: string;

  @ApiPropertyOptional({
    example: null,
    description: "null hoặc bỏ trống = danh mục gốc",
  })
  @IsOptional()
  @ToNumber()
  parentId?: number | null;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CategoryQueryDto extends PickType(QueryBaseDto, [
  "page",
  "limit",
  "search",
]) {
  @ApiPropertyOptional({
    description: "Lọc danh mục con theo parentId; để trống = tất cả",
  })
  @IsOptional()
  @ToNumber()
  parentId?: number;

  @ApiPropertyOptional({
    description:
      "true = chỉ active, false = chỉ inactive, bỏ trống = lấy tất cả",
  })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}
