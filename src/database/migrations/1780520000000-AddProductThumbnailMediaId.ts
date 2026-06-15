import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductThumbnailMediaId1780520000000 implements MigrationInterface {
  name = "AddProductThumbnailMediaId1780520000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "thumbnail_media_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_thumbnail_media" FOREIGN KEY ("thumbnail_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_products_thumbnail_media"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "thumbnail_media_id"`,
    );
  }
}
