import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PickType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { QueryBaseDto } from "src/common/constants/interface";
import { SearchResourceType } from "./search.types";

export class SearchQueryDto extends PickType(QueryBaseDto, [
  "page",
  "limit",
] as const) {
  @ApiProperty({ description: "Từ khóa tìm kiếm" })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @Transform(({ value }: { value: unknown }): string =>
    typeof value === "string" ? value.trim() : String(value),
  )
  search: string;

  @ApiPropertyOptional({
    enum: SearchResourceType,
    isArray: true,
    description:
      "Loại nội dung cần tìm (mặc định: product, blog, review). VD: types=product,blog",
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(SearchResourceType, { each: true })
  @Transform(({ value }): SearchResourceType[] | undefined => {
    if (value == null || value === "") return undefined;
    const items = Array.isArray(value) ? value : String(value).split(",");
    return items
      .map((item) => String(item).trim())
      .filter(Boolean) as SearchResourceType[];
  })
  types?: SearchResourceType[];
}
