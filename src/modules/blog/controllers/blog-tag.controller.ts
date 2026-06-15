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
  BlogTagQueryDto,
  CreateBlogTagDto,
  UpdateBlogTagDto,
} from "../constants/blog-tag.dto";
import { BlogTagResponse } from "../constants/blog-tag.response";
import { BlogTagService } from "../services/blog-tag.service";

@Controller("blog-tags")
@ApiTags("Blog Tag")
export class BlogTagController {
  constructor(private readonly blogTagService: BlogTagService) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: "Tạo tag blog" })
  async create(@Body() dto: CreateBlogTagDto): Promise<BlogTagResponse> {
    return this.blogTagService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Danh sách tag blog" })
  async findAll(@Query() dto: BlogTagQueryDto) {
    return this.blogTagService.findAll(dto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Chi tiết tag blog" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<BlogTagResponse> {
    return this.blogTagService.findOne(id);
  }

  @Put(":id")
  @Auth()
  @ApiOperation({ summary: "Cập nhật tag blog" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateBlogTagDto,
  ): Promise<BlogTagResponse> {
    return this.blogTagService.update(id, dto);
  }

  @Delete(":id")
  @Auth()
  @ApiOperation({ summary: "Xóa tag blog (soft delete)" })
  async delete(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.blogTagService.delete(id);
    return { message: "Deleted successfully" };
  }
}
