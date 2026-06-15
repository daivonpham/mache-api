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
  CreateProductReviewDto,
  ProductReviewQueryDto,
  UpdateProductReviewDto,
} from "../constants/product-review.dto";
import { ProductReviewResponse } from "../constants/product-review.response";
import { ProductReviewService } from "../services/product-review.service";

@Controller("product-reviews")
@ApiTags("Product Review")
export class ProductReviewController {
  constructor(private readonly productReviewService: ProductReviewService) {}

  @Post()
  @ApiOperation({
    summary: "Tạo bài review (kèm productIds, categoryIds)",
  })
  async create(
    @Body() dto: CreateProductReviewDto,
  ): Promise<ProductReviewResponse> {
    return this.productReviewService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Danh sách bài review sản phẩm" })
  async findAll(@Query() dto: ProductReviewQueryDto) {
    return this.productReviewService.findAll(dto);
  }

  @Get("by-slug/:slug")
  @ApiOperation({ summary: "Chi tiết bài review theo slug" })
  async findBySlug(
    @Param("slug") slug: string,
  ): Promise<ProductReviewResponse> {
    return this.productReviewService.findBySlug(slug);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết bài review" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ProductReviewResponse> {
    return this.productReviewService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({
    summary: "Cập nhật bài review (gửi productIds/categoryIds để thay quan hệ)",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProductReviewDto,
  ): Promise<ProductReviewResponse> {
    return this.productReviewService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa bài review (soft delete)" })
  async delete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.productReviewService.delete(id);
    return { message: "Deleted successfully" };
  }
}
