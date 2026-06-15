import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { QueryBaseDto, SortOrder } from "src/common/constants/interface";
import { ToNumber } from "src/common/decorators/transform.decorator";
import { IsYouTubeUrl } from "../validators/is-youtube-url.validator";
import { ReviewSeoDto } from "./review-seo.dto";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateProductReviewDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description:
      "youtube.com/watch?v=, youtu.be/, embed/, shorts/, hoặc 11 ký tự video id",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @IsYouTubeUrl()
  youtubeUrl?: string;

  @ApiProperty({ description: "ID sản phẩm (ít nhất 1)" })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  productIds: number[];

  @ApiProperty({ description: "ID danh mục review (ít nhất 1)" })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoryIds: number[];

  @ApiPropertyOptional({ type: ReviewSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReviewSeoDto)
  seo?: ReviewSeoDto | null;
}

export class UpdateProductReviewDto extends PartialType(
  CreateProductReviewDto,
) {}

export class ProductReviewQueryDto extends PickType(QueryBaseDto, [
  "page",
  "limit",
  "search",
  "sortBy",
  "sort",
]) {
  @ApiPropertyOptional({ description: "Lọc theo danh mục review" })
  @IsOptional()
  @ToNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: "Lọc theo sản phẩm" })
  @IsOptional()
  @ToNumber()
  productId?: number;
}

export const PRODUCT_REVIEW_DEFAULT_SORT_BY = "updatedAt";
export const PRODUCT_REVIEW_DEFAULT_SORT = SortOrder.DESC;
