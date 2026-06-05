import { BaseEntity } from "src/common/base/entities/base-entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import { Column, Entity, Index, Unique } from "typeorm";

@Entity("blog_categories")
@Unique(["slug"])
export class BlogCategory extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Searchable()
  @Index()
  @Column("varchar", { name: "slug", length: 255 })
  slug: string;
}
