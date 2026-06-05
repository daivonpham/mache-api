import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugBrand1780459359543 implements MigrationInterface {
    name = 'AddSlugBrand1780459359543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brands" ADD "slug" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "slug"`);
    }

}
