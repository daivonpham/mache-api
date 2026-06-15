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
  BlogCategoryQueryDto,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from "../constants/blog-category.dto";
import { BlogCategoryResponse } from "../constants/blog-category.response";
import { BlogCategoryService } from "../services/blog-category.service";

@Controller("blog-categories")
@ApiTags("Blog Category")
export class BlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: "Tạo danh mục blog" })
  async create(
    @Body() dto: CreateBlogCategoryDto,
  ): Promise<BlogCategoryResponse> {
    return this.blogCategoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Danh sách danh mục blog" })
  async findAll(@Query() dto: BlogCategoryQueryDto) {
    return this.blogCategoryService.findAll(dto);
  }

  @Get("by-slug/:slug")
  @ApiOperation({ summary: "Chi tiết danh mục blog theo slug" })
  async findBySlug(@Param("slug") slug: string): Promise<BlogCategoryResponse> {
    return this.blogCategoryService.findBySlug(slug);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết danh mục blog" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<BlogCategoryResponse> {
    return this.blogCategoryService.findOne(id);
  }

  @Put(":id")
  @Auth()
  @ApiOperation({ summary: "Cập nhật danh mục blog" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateBlogCategoryDto,
  ): Promise<BlogCategoryResponse> {
    return this.blogCategoryService.update(id, dto);
  }

  @Delete(":id")
  @Auth()
  @ApiOperation({ summary: "Xóa danh mục blog (soft delete)" })
  async delete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.blogCategoryService.delete(id);
    return { message: "Deleted successfully" };
  }
}
