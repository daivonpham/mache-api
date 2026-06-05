import { BlogPublishStatus, BlogSeo } from "./blog.types";
import { BlogCategoryResponse } from "./blog-category.response";
import { BlogTagResponse } from "./blog-tag.response";

export class BlogPostProductLinkResponse {
  productId: number;
  sortOrder: number;
  name?: string;
  slug?: string;
}

export class BlogPostCategoryLinkResponse {
  blogCategoryId: number;
  isPrimary: boolean;
  category?: BlogCategoryResponse;
}

export class BlogPostResponse {
  id: number;
  title: string;
  slug: string;
  content: string;
  description?: string;
  thumbnailMediaId?: number | null;
  thumbnailUrl?: string | null;
  seo?: BlogSeo | null;
  publishStatus: BlogPublishStatus;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  isActive: boolean;
  categories: BlogPostCategoryLinkResponse[];
  tags: BlogTagResponse[];
  products: BlogPostProductLinkResponse[];
  createdAt: Date;
  updatedAt: Date;
}
