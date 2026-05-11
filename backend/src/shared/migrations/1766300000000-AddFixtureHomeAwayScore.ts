import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Optional denormalized final score on fixture when goal events are missing or incomplete.
 */
export class AddFixtureHomeAwayScore1766300000000 implements MigrationInterface {
    name = 'AddFixtureHomeAwayScore1766300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('fixture');
        if (!hasTable) return;

        await queryRunner.query(`ALTER TABLE "fixture" ADD COLUMN IF NOT EXISTS "homeScore" integer`);
        await queryRunner.query(`ALTER TABLE "fixture" ADD COLUMN IF NOT EXISTS "awayScore" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('fixture');
        if (!hasTable) return;

        await queryRunner.query(`ALTER TABLE "fixture" DROP COLUMN IF EXISTS "awayScore"`);
        await queryRunner.query(`ALTER TABLE "fixture" DROP COLUMN IF EXISTS "homeScore"`);
    }
}
