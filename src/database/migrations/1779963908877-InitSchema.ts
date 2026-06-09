import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1779963908877 implements MigrationInterface {
  name = "InitSchema1779963908877";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying(80) NOT NULL, "password" character varying(255) NOT NULL, "is_super_admin" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_ee66de6cdc53993296d1ceb8aa0" UNIQUE ("email"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_359eb8520e0cc17e8600456f7d" ON "accounts" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying(255) NOT NULL, "account_id" integer, CONSTRAINT "REL_48f07a756b8f321aa99b06aee1" UNIQUE ("account_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4366b023132e3c83106c6d38bc" ON "profiles" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_token" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "token" character varying(255) NOT NULL, CONSTRAINT "PK_48cb6b5c20faa63157b3c1baf7f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79ac751931054ef450a2ee4777" ON "user_token" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_48f07a756b8f321aa99b06aee11" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_48f07a756b8f321aa99b06aee11"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_79ac751931054ef450a2ee4777"`,
    );
    await queryRunner.query(`DROP TABLE "user_token"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4366b023132e3c83106c6d38bc"`,
    );
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_359eb8520e0cc17e8600456f7d"`,
    );
    await queryRunner.query(`DROP TABLE "accounts"`);
  }
}
