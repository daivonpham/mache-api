import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCatalogueDraft1795000000001 implements MigrationInterface {
  name = "AddCatalogueDraft1795000000001";
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "catalogues" ADD COLUMN IF NOT EXISTS "is_draft" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_catalogues_is_draft" ON "catalogues"("is_draft")`,
    );
    // Bản nháp được phép chưa có danh mục / PDF / ảnh bìa
    await queryRunner.query(
      `ALTER TABLE "catalogues" ALTER COLUMN "category_id" DROP NOT NULL, ALTER COLUMN "pdf_media_id" DROP NOT NULL, ALTER COLUMN "thumbnail_media_id" DROP NOT NULL`,
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "catalogues" WHERE "is_draft" = true`);
    await queryRunner.query(
      `ALTER TABLE "catalogues" ALTER COLUMN "category_id" SET NOT NULL, ALTER COLUMN "pdf_media_id" SET NOT NULL, ALTER COLUMN "thumbnail_media_id" SET NOT NULL`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_catalogues_is_draft"`);
    await queryRunner.query(`ALTER TABLE "catalogues" DROP COLUMN "is_draft"`);
  }
}
