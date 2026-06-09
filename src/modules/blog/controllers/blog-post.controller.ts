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
  BlogPostQueryDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
} from "../constants/blog-post.dto";
import { BlogPostService } from "../services/blog-post.service";

@Controller("blog-posts")
@ApiTags("Blog Post")
export class BlogPostController {
  constructor(private readonly blogPostService: BlogPostService) {}

  @Post()
  @ApiOperation({
    summary: "Tạo bài viết (kèm categoryIds, tagIds, productIds tối đa 2)",
  })
  async create(@Body() dto: CreateBlogPostDto) {
    return this.blogPostService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Danh sách bài viết" })
  async findAll(@Query() dto: BlogPostQueryDto) {
    return this.blogPostService.findAll(dto);
  }

  @Get("by-slug/:slug")
  @ApiOperation({ summary: "Chi tiết bài viết theo slug" })
  async findBySlug(@Param("slug") slug: string) {
    return this.blogPostService.findBySlug(slug);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết bài viết" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.blogPostService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({
    summary:
      "Cập nhật bài viết (gửi categoryIds/tagIds/productIds để thay quan hệ)",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blogPostService.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Xóa bài viết (soft delete)" })
  async delete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.blogPostService.delete(id);
    return { message: "Deleted successfully" };
  }
}
