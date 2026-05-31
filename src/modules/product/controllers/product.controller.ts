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
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from "../constants/product.dto";
import { ProductResponse } from "../constants/product.response";
import { ProductService } from "../services/product.service";

@Controller("products")
@ApiTags("Product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: "Tạo sản phẩm (+ gallery qua galleryMediaIds)" })
  async create(@Body() dto: CreateProductDto): Promise<ProductResponse> {
    return this.productService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Danh sách sản phẩm" })
  async findAll(@Query() dto: ProductQueryDto) {
    return this.productService.findAll(dto);
  }

  @Get("by-slug/:slug")
  @ApiOperation({ summary: "Chi tiết sản phẩm theo slug" })
  async findBySlug(@Param("slug") slug: string): Promise<ProductResponse> {
    return this.productService.findBySlug(slug);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết sản phẩm (có gallery)" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductResponse> {
    return this.productService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({
    summary: "Cập nhật sản phẩm (gửi galleryMediaIds để thay gallery)",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return this.productService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa sản phẩm (soft delete)" })
  async delete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.productService.delete(id);
    return { message: "Deleted successfully" };
  }
}
