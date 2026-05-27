import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional } from "class-validator";
import { ToNumber } from "../decorators/transform.decorator";

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}
export interface GetAllGenericOptions {
  search?: string;
  searchBy?: string[];
  sortBy?: string;
  sort?: SortOrder;
  fromDate?: Date | string;
  toDate?: Date | string;
  dateColumn?: string;
  page?: number;
  limit?: number;
  relations?: string[];
  select?: string[];
  filter?: Record<string, any>;
  count?: string[];
}

export class QueryBaseDto {
  @ApiPropertyOptional({ example: "search term" })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: "createdAt" })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sort?: SortOrder;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    example: "2024-01-01T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    example: "2024-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @ToNumber()
  page: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @ToNumber()
  limit: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: unknown;
  timestamp: string;
  path?: string;
}
