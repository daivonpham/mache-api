import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { BlogPost } from "./blog-post.entity";
import { BlogTag } from "./blog-tag.entity";

@Entity("blog_post_tags")
export class BlogPostTag {
  @PrimaryColumn("int", { name: "blog_post_id" })
  blogPostId: number;

  @PrimaryColumn("int", { name: "blog_tag_id" })
  blogTagId: number;

  @ManyToOne(() => BlogPost, (post) => post.postTags, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blog_post_id" })
  post: BlogPost;

  @ManyToOne(() => BlogTag, { onDelete: "CASCADE" })
  @JoinColumn({ name: "blog_tag_id" })
  tag: BlogTag;
}
