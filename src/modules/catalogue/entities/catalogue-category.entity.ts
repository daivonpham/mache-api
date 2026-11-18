import { BaseEntity } from "src/common/base/entities/base-entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import { Column, Entity, Index, Unique } from "typeorm";

@Entity("catalogue_categories")
@Unique(["slug"])
export class CatalogueCategory extends BaseEntity {
  @Searchable()
  @Column("varchar", { length: 255 })
  name: string;

  @Searchable()
  @Index()
  @Column("varchar", { length: 255 })
  slug: string;
}
