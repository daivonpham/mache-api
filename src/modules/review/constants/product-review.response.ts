import { ReviewCategoryResponse } from "./review-category.response";
import { ReviewSeo } from "./review.types";

export class ProductReviewProductLinkResponse {
  productId: number;
  sortOrder: number;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

export class ProductReviewCategoryLinkResponse {
  reviewCategoryId: number;
  category?: Pick<ReviewCategoryResponse, "id" | "name" | "slug">;
}

export class ProductReviewResponse {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  youtubeUrl?: string | null;
  productIds: number[];
  categoryIds: number[];
  reviewProducts: ProductReviewProductLinkResponse[];
  reviewCategories: ProductReviewCategoryLinkResponse[];
  seo?: ReviewSeo | null;
  createdAt: Date;
  updatedAt: Date;
}
