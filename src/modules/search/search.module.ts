import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogPost } from "src/modules/blog/entities/blog-post.entity";
import { ProductReview } from "src/modules/review/entities/product-review.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { SearchController } from "./controllers/search.controller";
import { SearchService } from "./services/search.service";

@Module({
  imports: [TypeOrmModule.forFeature([Product, BlogPost, ProductReview])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
