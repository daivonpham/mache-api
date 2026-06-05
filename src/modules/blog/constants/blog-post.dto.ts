import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
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
import { BlogPublishStatus } from "./blog.types";
import { BlogSeoDto } from "./blog-seo.dto";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateBlogPostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(SLUG_PATTERN, {
    message: "Slug chỉ được dùng chữ thường, số và dấu gạch ngang",
  })
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "media.id sau khi upload" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @ToNumber()
  thumbnailMediaId?: number | null;

  @ApiPropertyOptional({ type: BlogSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BlogSeoDto)
  seo?: BlogSeoDto | null;

  @ApiPropertyOptional({ enum: BlogPublishStatus, default: BlogPublishStatus.DRAFT })
  @IsOptional()
  @IsEnum(BlogPublishStatus)
  publishStatus?: BlogPublishStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  scheduledAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;

  @ApiProperty({ description: "Danh mục blog (ít nhất 1)" })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoryIds: number[];

  @ApiPropertyOptional({ description: "Phải nằm trong categoryIds" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @ToNumber()
  primaryCategoryId?: number;

  @ApiPropertyOptional({ description: "Tag đã tạo sẵn" })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds?: number[];

  @ApiPropertyOptional({
    description: "Tối đa 2 product.id; thứ tự mảng = sortOrder",
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @IsInt({ each: true })
  @Min(1, { each: true })
  productIds?: number[];
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}

export class BlogPostQueryDto extends PickType(QueryBaseDto, [
  "page",
  "limit",
  "search",
  "sortBy",
  "sort",
]) {
  @ApiPropertyOptional({ enum: BlogPublishStatus })
  @IsOptional()
  @IsEnum(BlogPublishStatus)
  publishStatus?: BlogPublishStatus;

  @ApiPropertyOptional({ description: "Lọc bài thuộc danh mục blog" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @ToNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: "Lọc bài có tag" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @ToNumber()
  tagId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;
}
