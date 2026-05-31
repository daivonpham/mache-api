import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBrandTable1780200000000 implements MigrationInterface {
  name = "AddBrandTable1780200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "brands" (
        "id" SERIAL NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "name" character varying(255) NOT NULL,
        "description" text,
        "logo" character varying(500) NOT NULL,
        CONSTRAINT "PK_brands_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_brands_created_at" ON "brands" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_brands_created_at"`);
    await queryRunner.query(`DROP TABLE "brands"`);
  }
}
