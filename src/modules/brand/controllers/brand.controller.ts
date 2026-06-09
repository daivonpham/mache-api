import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  BrandQueryDto,
  CreateBrandDto,
  UpdateBrandDto,
} from "../constants/brand.dto";
import { BrandResponse } from "../constants/brand.response";
import { BrandService } from "../services/brand.service";

@Controller("brands")
@ApiTags("Brand")
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @ApiOperation({ summary: "Tạo thương hiệu" })
  async create(@Body() dto: CreateBrandDto): Promise<BrandResponse> {
    return this.brandService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Danh sách thương hiệu" })
  async findAll(@Query() dto: BrandQueryDto) {
    return this.brandService.findAll(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết thương hiệu" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<BrandResponse> {
    return this.brandService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Cập nhật thương hiệu" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateBrandDto,
  ): Promise<BrandResponse> {
    return this.brandService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa thương hiệu (soft delete)" })
  async delete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.brandService.delete(id);
    return { message: "Deleted successfully" };
  }
}
