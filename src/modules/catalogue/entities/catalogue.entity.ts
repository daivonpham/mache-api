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

  /** Bản nháp: chưa đủ thông tin, không hiển thị ngoài website (index tạo trong migration) */
  @Column("boolean", { name: "is_draft", default: false })
  isDraft: boolean;

  @Column("int", { name: "category_id", nullable: true })
  categoryId?: number | null;

  @ManyToOne(() => CatalogueCategory, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "category_id" })
  category?: CatalogueCategory | null;

  @Column("int", { name: "brand_id", nullable: true })
  brandId?: number | null;

  @ManyToOne(() => Brand, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "brand_id" })
  brand?: Brand | null;

  @Column("int", { name: "pdf_media_id", nullable: true })
  pdfMediaId?: number | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "pdf_media_id" })
  pdfMedia?: Media | null;

  @Column("int", { name: "thumbnail_media_id", nullable: true })
  thumbnailMediaId?: number | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "thumbnail_media_id" })
  thumbnailMedia?: Media | null;

  @Column("json", { nullable: true })
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    hashtags?: string[];
  };
}
