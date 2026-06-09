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
  getAll?: boolean;
}

export class QueryBaseDto {
  @ApiPropertyOptional({ description: "Từ khóa tìm kiếm" })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: "Tên cột sắp xếp" })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: SortOrder, description: "ASC hoặc DESC" })
  @IsOptional()
  @IsEnum(SortOrder)
  sort?: SortOrder;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    description: "Lọc từ ngày (ISO 8601)",
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    type: String,
    format: "date-time",
    description: "Lọc đến ngày (ISO 8601)",
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: "Trang (mặc định 1)" })
  @IsOptional()
  @ToNumber()
  page: number;

  @ApiPropertyOptional({ description: "Số bản ghi mỗi trang (mặc định 10)" })
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

export interface JwtPayload {
  sub: number;
  email: string;
  isSuperAdmin?: boolean;
  role?: string;
  permissions?: Array<{ code: string }>;
  iat?: number;
  exp?: number;
}
