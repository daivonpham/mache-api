import { BaseEntity } from "src/common/base/entities/base-entity";
import {
  Searchable,
  Sortable,
} from "src/common/decorators/entity-meta.decorator";
import { Media } from "src/modules/media/entities/media.entity";
import { BlogPublishStatus, BlogSeo } from "../constants/blog.types";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from "typeorm";
import { BlogPostCategory } from "./blog-post-category.entity";
import { BlogPostProduct } from "./blog-post-product.entity";
import { BlogPostTag } from "./blog-post-tag.entity";

@Entity("blog_posts")
@Unique(["slug"])
export class BlogPost extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "title", length: 255 })
  title: string;

  @Searchable()
  @Index()
  @Column("varchar", { name: "slug", length: 255 })
  slug: string;

  @Column("text", { name: "content" })
  content: string;

  @Searchable()
  @Column("text", { name: "description", nullable: true })
  description?: string;

  @Column("int", { name: "thumbnail_media_id", nullable: true })
  thumbnailMediaId?: number | null;

  @ManyToOne(() => Media, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "thumbnail_media_id" })
  thumbnailMedia?: Media;

  @Column("jsonb", { name: "seo", nullable: true })
  seo?: BlogSeo | null;

  @Index()
  @Column("varchar", {
    name: "publish_status",
    length: 20,
    default: BlogPublishStatus.DRAFT,
  })
  publishStatus: BlogPublishStatus;

  @Sortable()
  @Column("timestamptz", { name: "scheduled_at", nullable: true })
  scheduledAt?: Date | null;

  @Sortable()
  @Index()
  @Column("timestamptz", { name: "published_at", nullable: true })
  publishedAt?: Date | null;

  @OneToMany(() => BlogPostCategory, (link) => link.post)
  postCategories?: BlogPostCategory[];

  @OneToMany(() => BlogPostTag, (link) => link.post)
  postTags?: BlogPostTag[];

  @OneToMany(() => BlogPostProduct, (link) => link.post)
  postProducts?: BlogPostProduct[];
}
