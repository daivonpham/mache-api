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
import { ToBoolean } from "src/common/decorators/transform.decorator";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateBlogTagDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Matches(SLUG_PATTERN, {
    message: "Slug chỉ được dùng chữ thường, số và dấu gạch ngang",
  })
  slug: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}

export class UpdateBlogTagDto extends PartialType(CreateBlogTagDto) {}

export class BlogTagQueryDto extends PickType(QueryBaseDto, [
  "page",
  "limit",
  "search",
]) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}
