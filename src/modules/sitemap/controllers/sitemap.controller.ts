import { Controller, Get, Header } from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiTags } from "@nestjs/swagger";
import { SkipTransform } from "src/common/decorators/skip-transform.decorator";
import { SitemapService } from "../services/sitemap.service";

@Controller()
@ApiTags("Sitemap")
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get("sitemap.xml")
  @SkipTransform()
  @Header("Content-Type", "application/xml; charset=utf-8")
  @Header("Cache-Control", "public, max-age=3600")
  @ApiProduces("application/xml")
  @ApiOperation({
    summary: "Sitemap XML (static + products/blogs/reviews slugs)",
  })
  async getSitemap(): Promise<string> {
    return this.sitemapService.buildSitemapXml();
  }

  @Get("robots.txt")
  @SkipTransform()
  @Header("Content-Type", "text/plain; charset=utf-8")
  @Header("Cache-Control", "public, max-age=3600")
  @ApiProduces("text/plain")
  @ApiOperation({ summary: "robots.txt pointing to sitemap" })
  getRobots(): string {
    return this.sitemapService.buildRobotsTxt();
  }
}
