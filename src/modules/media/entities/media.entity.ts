import { BaseEntity } from "src/common/base/entities/base-entity";
import { Searchable } from "src/common/decorators/entity-meta.decorator";
import { Column, Entity, Index } from "typeorm";

export enum MediaKind {
  IMAGE = "image",
  DOCUMENT = "document",
}

@Entity("media")
export class Media extends BaseEntity {
  @Searchable()
  @Column("varchar", { name: "original_name", length: 255 })
  originalName: string;

  @Column("varchar", { name: "file_name", length: 255 })
  fileName: string;

  @Column("varchar", { name: "path", length: 500 })
  path: string;

  @Column("varchar", { name: "url", length: 500 })
  url: string;

  @Column("varchar", { name: "mime_type", length: 100 })
  mimeType: string;

  @Column("int", { name: "size" })
  size: number;

  @Index()
  @Column("varchar", { name: "kind", length: 20 })
  kind: MediaKind;

  @Column("varchar", { name: "alt", length: 255, nullable: true })
  alt?: string;

  @Index()
  @Column("int", { name: "uploaded_by", nullable: true })
  uploadedBy?: number;
}
