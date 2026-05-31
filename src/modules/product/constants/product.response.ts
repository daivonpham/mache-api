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
  brandId?: number | null;
  shopeeUrl?: string;
  specifications: ProductSpecification[];
  isFeatured: boolean;
  hasDiscount: boolean;
  discountPercent?: number | null;
  price?: string | null;
  seo?: ProductSeo | null;
  isActive: boolean;
  inStock: boolean;
  gallery: ProductGalleryItemResponse[];
  createdAt: Date;
  updatedAt?: Date;
}
