import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { BlogCategory } from "./blog-category.entity";
import { BlogPost } from "./blog-post.entity";

@Entity("blog_post_categories")
export class BlogPostCategory {
  @PrimaryColumn("int", { name: "blog_post_id" })
  blogPostId: number;

  @PrimaryColumn("int", { name: "blog_category_id" })
  blogCategoryId: number;

  @ManyToOne(() => BlogPost, (post) => post.postCategories, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "blog_post_id" })
  post: BlogPost;

  @ManyToOne(() => BlogCategory, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blog_category_id" })
  category: BlogCategory;

  @Index()
  @Column("boolean", { name: "is_primary", default: false })
  isPrimary: boolean;
}
