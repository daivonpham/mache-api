import { Media } from "src/modules/media/entities/media.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Product } from "./product.entity";

@Entity("product_images")
@Unique(["productId", "mediaId"])
export class ProductImage {
  @PrimaryGeneratedColumn("increment", { type: "int" })
  id: number;

  @Index()
  @Column("int", { name: "product_id" })
  productId: number;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Index()
  @Column("int", { name: "media_id" })
  mediaId: number;

  @ManyToOne(() => Media, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "media_id" })
  media: Media;

  @Column("int", { name: "sort_order", default: 0 })
  sortOrder: number;
}
