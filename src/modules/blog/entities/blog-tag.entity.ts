import { BaseEntity } from "src/common/base/entities/base-entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import { Column, Entity, Index, Unique } from "typeorm";

@Entity("blog_tags")
@Unique(["name"])
@Unique(["slug"])
export class BlogTag extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "name", length: 100 })
  name: string;

  @Searchable()
  @Index()
  @Column("varchar", { name: "slug", length: 120 })
  slug: string;
}
