import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeaturedToCompetition1765900000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE competition
            ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE competition DROP COLUMN IF EXISTS featured;
        `);
    }
}
