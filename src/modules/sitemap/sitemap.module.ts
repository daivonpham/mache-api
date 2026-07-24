import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogPost } from "src/modules/blog/entities/blog-post.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { ProductReview } from "src/modules/review/entities/product-review.entity";
import { SitemapController } from "./controllers/sitemap.controller";
import { SitemapService } from "./services/sitemap.service";

@Module({
  imports: [TypeOrmModule.forFeature([Product, BlogPost, ProductReview])],
  controllers: [SitemapController],
  providers: [SitemapService],
})
export class SitemapModule {}
