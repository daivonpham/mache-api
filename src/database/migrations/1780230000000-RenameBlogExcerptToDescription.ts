import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameBlogExcerptToDescription1780230000000 implements MigrationInterface {
  name = "RenameBlogExcerptToDescription1780230000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'blog_posts'
            AND column_name = 'excerpt'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'blog_posts'
            AND column_name = 'description'
        ) THEN
          ALTER TABLE "blog_posts" RENAME COLUMN "excerpt" TO "description";
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'blog_posts'
            AND column_name = 'description'
        ) AND NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'blog_posts'
            AND column_name = 'excerpt'
        ) THEN
          ALTER TABLE "blog_posts" RENAME COLUMN "description" TO "excerpt";
        END IF;
      END
      $$;
    `);
  }
}
