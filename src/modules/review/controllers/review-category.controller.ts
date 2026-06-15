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
import { Auth } from "src/common/decorators/auth.decorator";
import {
  CreateReviewCategoryDto,
  ReviewCategoryQueryDto,
  UpdateReviewCategoryDto,
} from "../constants/review-category.dto";
import { ReviewCategoryResponse } from "../constants/review-category.response";
import { ReviewCategoryService } from "../services/review-category.service";

@Controller("review-categories")
@ApiTags("Review Category")
export class ReviewCategoryController {
  constructor(private readonly reviewCategoryService: ReviewCategoryService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: "Tạo danh mục review" })
  async create(
    @Body() dto: CreateReviewCategoryDto,
  ): Promise<ReviewCategoryResponse> {
    return this.reviewCategoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Danh sách danh mục review" })
  async findAll(@Query() dto: ReviewCategoryQueryDto) {
    return this.reviewCategoryService.findAll(dto);
  }

  @Get("by-slug/:slug")
  @ApiOperation({ summary: "Chi tiết danh mục review theo slug" })
  async findBySlug(
    @Param("slug") slug: string,
  ): Promise<ReviewCategoryResponse> {
    return this.reviewCategoryService.findBySlug(slug);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết danh mục review" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ReviewCategoryResponse> {
    return this.reviewCategoryService.findOne(id);
  }

  @Put(":id")
  @Auth()
  @ApiOperation({ summary: "Cập nhật danh mục review" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateReviewCategoryDto,
  ): Promise<ReviewCategoryResponse> {
    return this.reviewCategoryService.update(id, dto);
  }

  @Delete(":id")
  @Auth()
  @ApiOperation({ summary: "Xóa danh mục review (soft delete)" })
  async delete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.reviewCategoryService.delete(id);
    return { message: "Deleted successfully" };
  }
}
