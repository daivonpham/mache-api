import { BaseEntity } from "src/common/base/entities/base-entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import { Brand } from "src/modules/brand/entities/brand.entity";
import { Media } from "src/modules/media/entities/media.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from "typeorm";
import { CatalogueCategory } from "./catalogue-category.entity";

@Entity("catalogues")
@Unique(["slug"])
export class Catalogue extends BaseEntity {
  @Searchable()
  @Column("varchar", { length: 255 })
  title: string;

  @Searchable()
  @Index()
  @Column("varchar", { length: 255 })
  slug: string;

  @Column("text", { nullable: true })
  description?: string;

  @Column("int", { name: "category_id" })
  categoryId: number;

  @ManyToOne(() => CatalogueCategory, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "category_id" })
  category: CatalogueCategory;

  @Column("int", { name: "brand_id", nullable: true })
  brandId?: number | null;

  @ManyToOne(() => Brand, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "brand_id" })
  brand?: Brand | null;

  @Column("int", { name: "pdf_media_id" })
  pdfMediaId: number;

  @ManyToOne(() => Media, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "pdf_media_id" })
  pdfMedia: Media;

  @Column("int", { name: "thumbnail_media_id" })
  thumbnailMediaId: number;

  @ManyToOne(() => Media, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "thumbnail_media_id" })
  thumbnailMedia: Media;

  @Column("json", { nullable: true })
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    hashtags?: string[];
  };
}
