import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlogTables1780220000000 implements MigrationInterface {
  name = "AddBlogTables1780220000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "blog_categories" (
        "id" SERIAL NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        CONSTRAINT "PK_blog_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_categories_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_categories_created_at" ON "blog_categories" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_categories_slug" ON "blog_categories" ("slug")`,
    );

    await queryRunner.query(`
      CREATE TABLE "blog_tags" (
        "id" SERIAL NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(100) NOT NULL,
        "slug" character varying(120) NOT NULL,
        CONSTRAINT "PK_blog_tags_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_tags_name" UNIQUE ("name"),
        CONSTRAINT "UQ_blog_tags_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_tags_created_at" ON "blog_tags" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_tags_slug" ON "blog_tags" ("slug")`,
    );

    await queryRunner.query(`
      CREATE TABLE "blog_posts" (
        "id" SERIAL NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "title" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "content" text NOT NULL,
        "description" text,
        "thumbnail_media_id" integer,
        "seo" jsonb,
        "publish_status" character varying(20) NOT NULL DEFAULT 'draft',
        "scheduled_at" TIMESTAMP WITH TIME ZONE,
        "published_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_blog_posts_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_posts_slug" UNIQUE ("slug"),
        CONSTRAINT "FK_blog_posts_thumbnail_media" FOREIGN KEY ("thumbnail_media_id")
          REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_created_at" ON "blog_posts" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_slug" ON "blog_posts" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_publish_status" ON "blog_posts" ("publish_status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_posts_published_at" ON "blog_posts" ("published_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "blog_post_categories" (
        "blog_post_id" integer NOT NULL,
        "blog_category_id" integer NOT NULL,
        "is_primary" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_blog_post_categories" PRIMARY KEY ("blog_post_id", "blog_category_id"),
        CONSTRAINT "FK_blog_post_categories_post" FOREIGN KEY ("blog_post_id")
          REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_blog_post_categories_category" FOREIGN KEY ("blog_category_id")
          REFERENCES "blog_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_post_categories_is_primary" ON "blog_post_categories" ("is_primary")`,
    );

    await queryRunner.query(`
      CREATE TABLE "blog_post_tags" (
        "blog_post_id" integer NOT NULL,
        "blog_tag_id" integer NOT NULL,
        CONSTRAINT "PK_blog_post_tags" PRIMARY KEY ("blog_post_id", "blog_tag_id"),
        CONSTRAINT "FK_blog_post_tags_post" FOREIGN KEY ("blog_post_id")
          REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_blog_post_tags_tag" FOREIGN KEY ("blog_tag_id")
          REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "blog_post_products" (
        "blog_post_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "sort_order" smallint NOT NULL DEFAULT 0,
        CONSTRAINT "PK_blog_post_products" PRIMARY KEY ("blog_post_id", "product_id"),
        CONSTRAINT "FK_blog_post_products_post" FOREIGN KEY ("blog_post_id")
          REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_blog_post_products_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_blog_post_products_sort_order" ON "blog_post_products" ("sort_order")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "blog_post_products"`);
    await queryRunner.query(`DROP TABLE "blog_post_tags"`);
    await queryRunner.query(`DROP TABLE "blog_post_categories"`);
    await queryRunner.query(`DROP TABLE "blog_posts"`);
    await queryRunner.query(`DROP TABLE "blog_tags"`);
    await queryRunner.query(`DROP TABLE "blog_categories"`);
  }
}
