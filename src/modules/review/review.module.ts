import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "src/modules/product/entities/product.entity";
import { ProductReviewController } from "./controllers/product-review.controller";
import { ReviewCategoryController } from "./controllers/review-category.controller";
import { ProductReviewCategory } from "./entities/product-review-category.entity";
import { ProductReviewProduct } from "./entities/product-review-product.entity";
import { ProductReview } from "./entities/product-review.entity";
import { ReviewCategory } from "./entities/review-category.entity";
import { ProductReviewService } from "./services/product-review.service";
import { ReviewCategoryService } from "./services/review-category.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductReview,
      ReviewCategory,
      ProductReviewProduct,
      ProductReviewCategory,
      Product,
    ]),
  ],
  controllers: [ReviewCategoryController, ProductReviewController],
  providers: [ReviewCategoryService, ProductReviewService],
  exports: [ReviewCategoryService, ProductReviewService],
})
export class ReviewModule {}
