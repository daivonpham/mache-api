import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewTables1780530000000 implements MigrationInterface {
  name = "AddReviewTables1780530000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "review_categories" (
        "id" SERIAL NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        CONSTRAINT "PK_review_categories_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_review_categories_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_review_categories_created_at" ON "review_categories" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_review_categories_slug" ON "review_categories" ("slug")`,
    );

    await queryRunner.query(`
      CREATE TABLE "product_reviews" (
        "id" SERIAL NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "title" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "description" text,
        "youtube_url" character varying(500),
        "seo" jsonb,
        CONSTRAINT "PK_product_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_reviews_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_reviews_created_at" ON "product_reviews" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_reviews_slug" ON "product_reviews" ("slug")`,
    );

    await queryRunner.query(`
      CREATE TABLE "product_review_products" (
        "review_id" integer NOT NULL,
        "product_id" integer NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_product_review_products" PRIMARY KEY ("review_id", "product_id"),
        CONSTRAINT "FK_product_review_products_review" FOREIGN KEY ("review_id")
          REFERENCES "product_reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_product_review_products_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_review_products_product_id" ON "product_review_products" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_review_products_sort_order" ON "product_review_products" ("sort_order")`,
    );

    await queryRunner.query(`
      CREATE TABLE "product_review_categories" (
        "review_id" integer NOT NULL,
        "review_category_id" integer NOT NULL,
        CONSTRAINT "PK_product_review_categories" PRIMARY KEY ("review_id", "review_category_id"),
        CONSTRAINT "FK_product_review_categories_review" FOREIGN KEY ("review_id")
          REFERENCES "product_reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_product_review_categories_category" FOREIGN KEY ("review_category_id")
          REFERENCES "review_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_product_review_categories_category_id" ON "product_review_categories" ("review_category_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_review_categories_category_id"`,
    );
    await queryRunner.query(`DROP TABLE "product_review_categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_review_products_sort_order"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_review_products_product_id"`,
    );
    await queryRunner.query(`DROP TABLE "product_review_products"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_product_reviews_slug"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_product_reviews_created_at"`,
    );
    await queryRunner.query(`DROP TABLE "product_reviews"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_review_categories_slug"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_review_categories_created_at"`,
    );
    await queryRunner.query(`DROP TABLE "review_categories"`);
  }
}
