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
  @ApiProperty() @IsInt() @Min(1) @ToNumber() categoryId: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @ToNumber() brandId?:
    | number
    | null;
  @ApiProperty() @IsInt() @Min(1) @ToNumber() pdfMediaId: number;
  @ApiProperty() @IsInt() @Min(1) @ToNumber() thumbnailMediaId: number;
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
  @ApiPropertyOptional({ enum: ["newest", "oldest", "title"] })
  @IsOptional()
  @IsString()
  sort?: string;
}
