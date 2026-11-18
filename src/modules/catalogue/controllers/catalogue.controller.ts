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
  CatalogueCategoryQueryDto,
  CatalogueQueryDto,
  CreateCatalogueCategoryDto,
  CreateCatalogueDto,
  UpdateCatalogueCategoryDto,
  UpdateCatalogueDto,
} from "../constants/catalogue.dto";
import { CatalogueService } from "../services/catalogue.service";

@ApiTags("Catalogue")
@Controller("catalogues")
export class CatalogueController {
  constructor(private readonly service: CatalogueService) {}
  @Get()
  @ApiOperation({ summary: "Danh sách catalogue" })
  findAll(@Query() dto: CatalogueQueryDto) {
    return this.service.findAll(dto);
  }
  @Get("stats")
  @Auth()
  @ApiOperation({ summary: "Thống kê catalogue (admin)" })
  stats() {
    return this.service.stats();
  }
  @Get("categories")
  @ApiOperation({ summary: "Danh sách danh mục catalogue" })
  categories(@Query() dto: CatalogueCategoryQueryDto) {
    return this.service.categoriesAll(dto);
  }
  @Post("categories")
  @Auth()
  createCategory(@Body() dto: CreateCatalogueCategoryDto) {
    return this.service.createCategory(dto);
  }
  @Put("categories/:id")
  @Auth()
  updateCategory(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCatalogueCategoryDto,
  ) {
    return this.service.updateCategory(id, dto);
  }
  @Delete("categories/:id")
  @Auth()
  deleteCategory(@Param("id", ParseIntPipe) id: number) {
    return this.service.deleteCategory(id);
  }
  @Get("by-slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.service.findBySlug(slug);
  }
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Post()
  @Auth()
  create(@Body() dto: CreateCatalogueDto) {
    return this.service.create(dto);
  }
  @Put(":id")
  @Auth()
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCatalogueDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(":id")
  @Auth()
  delete(@Param("id", ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
