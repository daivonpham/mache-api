import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCatalogueTables1795000000000 implements MigrationInterface {
  name = "AddCatalogueTables1795000000000";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "catalogue_categories" ("id" SERIAL PRIMARY KEY, "is_active" boolean NOT NULL DEFAULT true, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "deleted_at" timestamp, "name" varchar(255) NOT NULL, "slug" varchar(255) NOT NULL UNIQUE)`,
    );
    await queryRunner.query(
      `CREATE TABLE "catalogues" ("id" SERIAL PRIMARY KEY, "is_active" boolean NOT NULL DEFAULT true, "created_at" timestamp NOT NULL DEFAULT now(), "updated_at" timestamp NOT NULL DEFAULT now(), "deleted_at" timestamp, "title" varchar(255) NOT NULL, "slug" varchar(255) NOT NULL UNIQUE, "description" text, "category_id" int NOT NULL REFERENCES "catalogue_categories"("id") ON DELETE RESTRICT, "brand_id" int REFERENCES "brands"("id") ON DELETE SET NULL, "pdf_media_id" int NOT NULL REFERENCES "media"("id") ON DELETE RESTRICT, "thumbnail_media_id" int NOT NULL REFERENCES "media"("id") ON DELETE RESTRICT, "seo" json)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_catalogues_category_id" ON "catalogues"("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_catalogues_brand_id" ON "catalogues"("brand_id")`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "catalogues"`);
    await queryRunner.query(`DROP TABLE "catalogue_categories"`);
  }
}
