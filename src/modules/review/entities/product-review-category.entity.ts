import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { ProductReview } from "./product-review.entity";
import { ReviewCategory } from "./review-category.entity";

@Entity("product_review_categories")
export class ProductReviewCategory {
  @PrimaryColumn("int", { name: "review_id" })
  productReviewId: number;

  @PrimaryColumn("int", { name: "review_category_id" })
  reviewCategoryId: number;

  @ManyToOne(() => ProductReview, (review) => review.reviewCategories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "review_id" })
  review: ProductReview;

  @ManyToOne(() => ReviewCategory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "review_category_id" })
  category: ReviewCategory;
}
