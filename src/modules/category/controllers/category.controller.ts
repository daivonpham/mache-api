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
    CategoryQueryDto,
    CreateCategoryDto,
    UpdateCategoryDto,
  } from "../constants/category.dto";
  import { CategoryResponse } from "../constants/category.response";
  import { CategoryService } from "../services/category.service";
  
  @Controller("categories")
  @ApiTags("Category")
  export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}
  
    @Post()
    @ApiOperation({ summary: "Tạo danh mục" })
    async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponse> {
      return this.categoryService.create(dto);
    }
  
    @Get()
    @ApiOperation({ summary: "Danh sách danh mục" })
    async findAll(@Query() dto: CategoryQueryDto) {
      return this.categoryService.findAll(dto);
    }
  
    @Get("by-slug/:slug")
    @ApiOperation({ summary: "Chi tiết danh mục theo slug" })
    async findBySlug(@Param("slug") slug: string): Promise<CategoryResponse> {
      return this.categoryService.findBySlug(slug);
    }
  
    @Get(":id")
    @ApiOperation({ summary: "Chi tiết danh mục theo id" })
    async findOne(
      @Param("id", ParseIntPipe) id: number,
    ): Promise<CategoryResponse> {
      return this.categoryService.findOne(id);
    }
  
    @Put(":id")
    @ApiOperation({ summary: "Cập nhật danh mục" })
    async update(
      @Param("id", ParseIntPipe) id: number,
      @Body() dto: UpdateCategoryDto,
    ): Promise<CategoryResponse> {
      return this.categoryService.update(id, dto);
    }
  
    @Delete(":id")
    @ApiOperation({ summary: "Xóa danh mục (soft delete)" })
    async delete(
      @Param("id", ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
      await this.categoryService.delete(id);
      return { message: "Deleted successfully" };
    }
  }