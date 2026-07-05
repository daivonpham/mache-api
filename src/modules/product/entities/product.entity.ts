import { BaseEntity } from "src/common/base/entities/base-entity";
import {
  Searchable,
  Sortable,
} from "src/common/decorators/entity-meta.decorator";
import { Brand } from "src/modules/brand/entities/brand.entity";
import { Category } from "src/modules/category/entities/category.entity";
import { Media } from "src/modules/media/entities/media.entity";
import {
  ProductSeo,
  ProductSpecification,
} from "src/modules/product/constants/product.types";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity("products")
@Unique(["slug"])
@Unique(["sku"])
export class Product extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Searchable()
  @Index()
  @Column("varchar", { name: "slug", length: 255 })
  slug: string;

  @Searchable()
  @Index()
  @Column("varchar", { name: "sku", length: 100 })
  sku: string;

  @Column("text", { name: "description", nullable: true })
  description?: string;

  @Column("int", { name: "thumbnail_media_id", nullable: true })
  thumbnailMediaId?: number | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "thumbnail_media_id" })
  thumbnailMedia?: Media;

  @Index()
  @Column("int", { name: "category_id" })
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category?: Category;

  @Index()
  @Column("int", { name: "brand_id", nullable: true })
  brandId?: number | null;

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: "brand_id" })
  brand?: Brand;

  @Column("varchar", { name: "shopee_url", length: 500, nullable: true })
  shopeeUrl?: string;

  @Column("jsonb", { name: "specifications", default: () => "'[]'" })
  specifications: ProductSpecification[];

  @Column("boolean", { name: "is_featured", default: false })
  isFeatured: boolean;

  @Column("boolean", { name: "has_discount", default: false })
  hasDiscount: boolean;

  @Column("int", { name: "discount_percent", nullable: true })
  discountPercent?: number | null;

  /** DB: text thô (vd. "89000", "Liên hệ", "????") — không ép kiểu số ở DB */
  @Column("varchar", { name: "price", length: 255, nullable: true })
  price?: string | null;

  @Column("jsonb", { name: "seo", nullable: true })
  seo?: ProductSeo | null;

  @Column("boolean", { name: "in_stock", default: true })
  inStock: boolean;

  @Column("int", { name: "view_count", default: 0 })
  viewCount: number;

  @Sortable()
  @Column("int", { name: "shopee_click_count", default: 0 })
  shopeeClickCount: number;

  @OneToMany(() => ProductImage, (image) => image.product)
  images?: ProductImage[];
}
