import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSportapiFixtureTeamStatSource1768900000000 implements MigrationInterface {
    name = 'AddSportapiFixtureTeamStatSource1768900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TYPE "fixture_team_stat_source_enum" ADD VALUE 'sportapi';
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
    }

    public async down(): Promise<void> {
        // PostgreSQL does not support removing enum values safely.
    }
}
