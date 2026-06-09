import { BaseEntity } from "src/common/base/entities/base-entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import { ReviewSeo } from "../constants/review.types";
import { Column, Entity, Index, OneToMany, Unique } from "typeorm";
import { ProductReviewCategory } from "./product-review-category.entity";
import { ProductReviewProduct } from "./product-review-product.entity";

@Entity("product_reviews")
@Unique(["slug"])
export class ProductReview extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "title", length: 255 })
  title: string;

  @Searchable()
  @Index()
  @Column("varchar", { name: "slug", length: 255 })
  slug: string;

  @Searchable()
  @Column("text", { name: "description", nullable: true })
  description?: string;

  @Searchable()
  @Column("varchar", { name: "youtube_url", length: 500, nullable: true })
  youtubeUrl?: string;

  @Column("jsonb", { name: "seo", nullable: true })
  seo?: ReviewSeo | null;

  @OneToMany(() => ProductReviewProduct, (link) => link.review)
  reviewProducts?: ProductReviewProduct[];

  @OneToMany(() => ProductReviewCategory, (link) => link.review)
  reviewCategories?: ProductReviewCategory[];
}
