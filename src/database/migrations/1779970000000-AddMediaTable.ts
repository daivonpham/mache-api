import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMediaTable1779970000000 implements MigrationInterface {
  name = "AddMediaTable1779970000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "media" (
        "id" SERIAL NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "original_name" character varying(255) NOT NULL,
        "file_name" character varying(255) NOT NULL,
        "path" character varying(500) NOT NULL,
        "url" character varying(500) NOT NULL,
        "mime_type" character varying(100) NOT NULL,
        "size" integer NOT NULL,
        "kind" character varying(20) NOT NULL,
        "alt" character varying(255),
        "uploaded_by" integer,
        CONSTRAINT "PK_media_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_media_created_at" ON "media" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_media_kind" ON "media" ("kind")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_media_uploaded_by" ON "media" ("uploaded_by")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_media_uploaded_by"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_media_kind"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_media_created_at"`);
    await queryRunner.query(`DROP TABLE "media"`);
  }
}
