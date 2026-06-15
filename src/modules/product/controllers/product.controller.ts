import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Auth } from "src/common/decorators/auth.decorator";
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from "../constants/product.dto";
import {
  ProductResponse,
  ProductShopeeClickCountResponse,
  ProductViewCountResponse,
} from "../constants/product.response";
import { ProductService } from "../services/product.service";

@Controller("products")
@ApiTags("Product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth()
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
  @Auth()
  @ApiOperation({
    summary: "Cập nhật sản phẩm (gửi galleryMediaIds để thay gallery)",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return this.productService.update(id, dto);
  }

  @Patch(":id/toggle-in-stock")
  @Auth()
  @ApiOperation({
    summary: "Đảo trạng thái tồn kho (inStock true ↔ false)",
  })
  async toggleInStock(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductResponse> {
    return this.productService.toggleInStock(id);
  }

  @Patch(":id/toggle-active")
  @Auth()
  @ApiOperation({
    summary: "Đảo trạng thái hiển thị (isActive true ↔ false)",
  })
  async toggleIsActive(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductResponse> {
    return this.productService.toggleIsActive(id);
  }

  @Patch(":id/track-view")
  @ApiOperation({ summary: "Ghi nhận lượt xem chi tiết sản phẩm (+1)" })
  async trackView(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductViewCountResponse> {
    return this.productService.trackView(id);
  }

  @Patch(":id/track-shopee-click")
  @ApiOperation({ summary: "Ghi nhận lượt click vào Shopee (+1)" })
  async trackShopeeClick(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductShopeeClickCountResponse> {
    return this.productService.trackShopeeClick(id);
  }

  @Delete(":id")
  @Auth()
  @ApiOperation({ summary: "Xóa sản phẩm (soft delete)" })
  async delete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.productService.delete(id);
    return { message: "Deleted successfully" };
  }
}
