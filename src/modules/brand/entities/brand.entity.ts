import { BaseEntity } from "src/common/base/entities/base-entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import { Media } from "src/modules/media/entities/media.entity";
import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";

@Entity("brands")
export class Brand extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("varchar", { name: "slug", length: 255, nullable: true })
  slug: string;

  @Column("text", { name: "description", nullable: true })
  description?: string;

  @Index()
  @Column("int", { name: "logo_media_id" })
  logoMediaId: number;

  @OneToOne(() => Media)
  @JoinColumn({ name: "logo_media_id" })
  logoMedia?: Media;
}
