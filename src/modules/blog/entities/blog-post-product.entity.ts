import { Product } from "src/modules/product/entities/product.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { BlogPost } from "./blog-post.entity";

@Entity("blog_post_products")
export class BlogPostProduct {
  @PrimaryColumn("int", { name: "blog_post_id" })
  blogPostId: number;

  @PrimaryColumn("int", { name: "product_id" })
  productId: number;

  @ManyToOne(() => BlogPost, (post) => post.postProducts, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "blog_post_id" })
  post: BlogPost;

  @ManyToOne(() => Product, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Index()
  @Column("smallint", { name: "sort_order", default: 0 })
  sortOrder: number;
}
