import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Media } from "src/modules/media/entities/media.entity";
import { Product } from "src/modules/product/entities/product.entity";
import { BlogCategoryController } from "./controllers/blog-category.controller";
import { BlogPostController } from "./controllers/blog-post.controller";
import { BlogTagController } from "./controllers/blog-tag.controller";
import { BlogCategory } from "./entities/blog-category.entity";
import { BlogPostCategory } from "./entities/blog-post-category.entity";
import { BlogPostProduct } from "./entities/blog-post-product.entity";
import { BlogPostTag } from "./entities/blog-post-tag.entity";
import { BlogPost } from "./entities/blog-post.entity";
import { BlogTag } from "./entities/blog-tag.entity";
import { BlogCategoryService } from "./services/blog-category.service";
import { BlogPostService } from "./services/blog-post.service";
import { BlogTagService } from "./services/blog-tag.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlogPost,
      BlogCategory,
      BlogTag,
      BlogPostCategory,
      BlogPostTag,
      BlogPostProduct,
      Product,
      Media,
    ]),
  ],
  controllers: [BlogCategoryController, BlogTagController, BlogPostController],
  providers: [BlogCategoryService, BlogTagService, BlogPostService],
  exports: [BlogCategoryService, BlogTagService, BlogPostService],
})
export class BlogModule {}
