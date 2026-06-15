import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { SearchQueryDto } from "../constants/search.dto";
import { GlobalSearchResponse } from "../constants/search.response";
import { SearchService } from "../services/search.service";

@Controller("search")
@ApiTags("Search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary:
      "Tìm kiếm chung theo @Searchable() trên product, blog post, product review",
  })
  async search(@Query() dto: SearchQueryDto): Promise<GlobalSearchResponse> {
    return this.searchService.search(dto);
  }
}
