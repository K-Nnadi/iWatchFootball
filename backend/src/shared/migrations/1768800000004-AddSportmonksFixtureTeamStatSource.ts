import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSportmonksFixtureTeamStatSource1768800000004 implements MigrationInterface {
    name = 'AddSportmonksFixtureTeamStatSource1768800000004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TYPE "fixture_team_stat_source_enum" ADD VALUE 'sportmonks';
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
    }

    public async down(): Promise<void> {
        // PostgreSQL does not support removing enum values safely.
    }
}
