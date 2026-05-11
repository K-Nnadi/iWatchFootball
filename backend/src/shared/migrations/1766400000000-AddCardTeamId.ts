import { MigrationInterface, QueryRunner } from 'typeorm';

/** Cards mirror goals/substitutions: store receiving player's team for filters and UI. */
export class AddCardTeamId1766400000000 implements MigrationInterface {
    name = 'AddCardTeamId1766400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('card');
        if (!hasTable) return;

        await queryRunner.query(`ALTER TABLE "card" ADD COLUMN IF NOT EXISTS "teamId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasTable = await queryRunner.hasTable('card');
        if (!hasTable) return;

        await queryRunner.query(`ALTER TABLE "card" DROP COLUMN IF EXISTS "teamId"`);
    }
}
