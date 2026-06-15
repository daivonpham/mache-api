import { ProductSeo, ProductSpecification } from "./product.types";

export class ProductGalleryItemResponse {
  id: number;
  mediaId: number;
  sortOrder: number;
  url: string;
  alt?: string;
}

export class ProductResponse {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  brandId?: number | null;
  brandName?: string;
  shopeeUrl?: string;
  specifications: ProductSpecification[];
  isFeatured: boolean;
  hasDiscount: boolean;
  discountPercent?: number | null;
  price?: string | null;
  seo?: ProductSeo | null;
  isActive: boolean;
  inStock: boolean;
  thumbnailMediaId?: number | null;
  thumbnailUrl?: string | null;
  gallery: ProductGalleryItemResponse[];
  viewCount: number;
  shopeeClickCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export class ProductViewCountResponse {
  id: number;
  viewCount: number;
}

export class ProductShopeeClickCountResponse {
  id: number;
  shopeeClickCount: number;
}
