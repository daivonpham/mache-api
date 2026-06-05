import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductAndGalleryTables1780210000000
  implements MigrationInterface
{
  name = "AddProductAndGalleryTables1780210000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" SERIAL NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "sku" character varying(100) NOT NULL,
        "description" text,
        "category_id" integer NOT NULL,
        "brand_id" integer,
        "shopee_url" character varying(500),
        "specifications" jsonb NOT NULL DEFAULT '[]',
        "is_featured" boolean NOT NULL DEFAULT false,
        "has_discount" boolean NOT NULL DEFAULT false,
        "discount_percent" integer,
        "price" character varying(255),
        "seo" jsonb,
        "in_stock" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_slug" UNIQUE ("slug"),
        CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("category_id")
          REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_products_brand" FOREIGN KEY ("brand_id")
          REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_created_at" ON "products" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_category_id" ON "products" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_products_brand_id" ON "products" ("brand_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "product_images" (
        "id" SERIAL NOT NULL,
        "product_id" integer NOT NULL,
        "media_id" integer NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_product_images_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_images_product_media" UNIQUE ("product_id", "media_id"),
        CONSTRAINT "FK_product_images_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_product_images_media" FOREIGN KEY ("media_id")
          REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_images_product_id" ON "product_images" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_images_media_id" ON "product_images" ("media_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_product_images_media_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_product_images_product_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "product_images"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_products_brand_id"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_products_category_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_products_created_at"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }
}
