import { Product } from "src/modules/product/entities/product.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { ProductReview } from "./product-review.entity";

@Entity("product_review_products")
export class ProductReviewProduct {
  @PrimaryColumn("int", { name: "review_id" })
  productReviewId: number;

  @PrimaryColumn("int", { name: "product_id" })
  productId: number;

  @ManyToOne(() => ProductReview, (review) => review.reviewProducts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "review_id" })
  review: ProductReview;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Index()
  @Column("int", { name: "sort_order", default: 0 })
  sortOrder: number;
}
