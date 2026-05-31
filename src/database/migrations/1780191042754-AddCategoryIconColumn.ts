import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryIconColumn1780191042754 implements MigrationInterface {
    name = 'AddCategoryIconColumn1780191042754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "icon"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "icon" character varying(50) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "icon"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "icon" text`);
    }

}
