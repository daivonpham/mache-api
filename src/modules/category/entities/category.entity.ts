import { BaseEntity } from "src/common/base/entities/base-entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from "typeorm";

@Entity("categories")
@Unique(["slug"])
export class Category extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Searchable()
  @Index()
  @Column("varchar", { name: "slug", length: 255 })
  slug: string;

  @Column("text", { name: "description", nullable: true })
  description?: string;

  @Column("varchar", { name: "icon", length: 50 })
  icon: string;

  /** null = danh mục gốc (cha) */
  @Column("int", { name: "parent_id", nullable: true })
  parentId?: number | null;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  @JoinColumn({ name: "parent_id" })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children?: Category[];
}
