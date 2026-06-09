import { MigrationInterface, QueryRunner } from "typeorm";

export class BrandLogoMediaId1780500000000 implements MigrationInterface {
  name = "BrandLogoMediaId1780500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "logo"`);
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "logo_media_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD CONSTRAINT "FK_brands_logo_media" FOREIGN KEY ("logo_media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_brands_logo_media_id" ON "brands" ("logo_media_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_brands_logo_media_id"`);
    await queryRunner.query(
      `ALTER TABLE "brands" DROP CONSTRAINT "FK_brands_logo_media"`,
    );
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "logo_media_id"`);
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "logo" character varying(500) NOT NULL`,
    );
  }
}
