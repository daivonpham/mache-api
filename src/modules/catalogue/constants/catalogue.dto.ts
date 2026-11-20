import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { QueryBaseDto } from "src/common/constants/interface";
import { ToBoolean, ToNumber } from "src/common/decorators/transform.decorator";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateCatalogueCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
  @ApiProperty()
  @IsString()
  @Matches(SLUG_PATTERN)
  @MaxLength(255)
  slug: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}
export class CatalogueCategoryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}
export class UpdateCatalogueCategoryDto extends PartialType(
  CreateCatalogueCategoryDto,
) {}

export class CatalogueSeoDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() keywords?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];
}

export class CreateCatalogueDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(255) title: string;
  @ApiProperty()
  @IsString()
  @Matches(SLUG_PATTERN)
  @MaxLength(255)
  slug: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  /** Bản nháp chỉ cần tên + slug; danh mục / PDF / ảnh bìa bắt buộc khi xuất bản (kiểm tra ở service) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isDraft?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @ToNumber() categoryId?:
    | number
    | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @ToNumber() brandId?:
    | number
    | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @ToNumber() pdfMediaId?:
    | number
    | null;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @ToNumber()
  thumbnailMediaId?: number | null;
  @ApiPropertyOptional({ type: CatalogueSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CatalogueSeoDto)
  seo?: CatalogueSeoDto;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}
export class UpdateCatalogueDto extends PartialType(CreateCatalogueDto) {}
export class CatalogueQueryDto extends PickType(QueryBaseDto, [
  "page",
  "limit",
  "search",
]) {
  @ApiPropertyOptional() @IsOptional() @IsInt() @ToNumber() categoryId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @ToNumber() brandId?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isDraft?: boolean;
  @ApiPropertyOptional({ enum: ["newest", "oldest", "title"] })
  @IsOptional()
  @IsString()
  sort?: string;
}
