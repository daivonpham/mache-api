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
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { QueryBaseDto } from "src/common/constants/interface";
import { ToBoolean, ToNumber } from "src/common/decorators/transform.decorator";
import { ProductSeo, ProductSpecification } from "./product.types";

export enum ProductPriceSort {
  ASC = "asc",
  DESC = "desc",
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ProductSpecificationDto implements ProductSpecification {
  @ApiProperty({ example: "Chất liệu" })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: "HSS" })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class ProductSeoDto implements ProductSeo {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  keywords?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: "Mũi khoan Bosch HSS 6mm" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: "mui-khoan-bosch-hss-6mm" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(SLUG_PATTERN, {
    message: "Slug chỉ được dùng chữ thường, số và dấu gạch ngang",
  })
  slug: string;

  @ApiProperty({ example: "BOS-DRILL-6" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @ToNumber()
  categoryId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @ToNumber()
  brandId?: number | null;

  @ApiPropertyOptional({ example: "https://shopee.vn/..." })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  shopeeUrl?: string;

  @ApiPropertyOptional({ type: [ProductSpecificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSpecificationDto)
  specifications?: ProductSpecificationDto[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  hasDiscount?: boolean;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  discountPercent?: number | null;

  @ApiPropertyOptional({
    example: "89000",
    description: "Text: số, Liên hệ, ????...",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  price?: string | null;

  @ApiPropertyOptional({ type: ProductSeoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductSeoDto)
  seo?: ProductSeoDto | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    example: 12,
    description: "media.id ảnh thumbnail sau khi upload",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @ToNumber()
  thumbnailMediaId?: number | null;

  @ApiPropertyOptional({
    example: [12, 45],
    description: "media.id sau khi upload — thứ tự mảng = sortOrder gallery",
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  galleryMediaIds?: number[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ProductQueryDto extends PickType(QueryBaseDto, [
  "page",
  "limit",
  "search",
]) {
  @ApiPropertyOptional({ description: "Lọc theo danh mục" })
  @IsOptional()
  @ToNumber()
  categoryId?: number;

  @ApiPropertyOptional({ description: "Lọc theo thương hiệu" })
  @IsOptional()
  @ToNumber()
  brandId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  inStock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isDiscount?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isClick?: boolean;

  @ApiPropertyOptional({
    enum: ProductPriceSort,
    description: "Sắp xếp theo giá: asc = thấp → cao, desc = cao → thấp",
  })
  @IsOptional()
  @IsEnum(ProductPriceSort)
  priceSort?: ProductPriceSort;
}
