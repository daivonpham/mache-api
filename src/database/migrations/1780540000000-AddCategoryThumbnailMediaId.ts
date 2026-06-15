import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryThumbnailMediaId1780540000000 implements MigrationInterface {
  name = "AddCategoryThumbnailMediaId1780540000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "thumbnail_media_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_thumbnail_media" FOREIGN KEY ("thumbnail_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_thumbnail_media"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "thumbnail_media_id"`,
    );
  }
}
