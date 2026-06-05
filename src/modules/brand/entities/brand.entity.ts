import { BaseEntity } from "src/common/base/entities/base-entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import { Column, Entity } from "typeorm";

@Entity("brands")
export class Brand extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("varchar", { name: "slug", length: 255, nullable: true })
  slug: string;

  @Column("text", { name: "description", nullable: true })
  description?: string;

  @Column("varchar", { name: "logo", length: 500 })
  logo: string;
}
