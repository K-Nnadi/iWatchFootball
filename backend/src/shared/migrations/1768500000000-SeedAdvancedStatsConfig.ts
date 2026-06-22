import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdvancedStatsConfig1768500000000 implements MigrationInterface {
    name = 'SeedAdvancedStatsConfig1768500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES
                (
                    'player_advanced_stats_enabled',
                    'boolean',
                    true,
                    'When true, player pages show detailed performance stats (xG, xA, shooting, passing, etc.)'
                ),
                (
                    'attendance_stats_enabled',
                    'boolean',
                    true,
                    'When true, users can view the Stats tab on the Logs page (goals, assists, venues leaderboards)'
                ),
                (
                    'attendance_advanced_stats_enabled',
                    'boolean',
                    true,
                    'When true, users can view advanced attendance stats leaderboards and compare stats with friends'
                )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "platformConfig"
            WHERE "key" IN (
                'player_advanced_stats_enabled',
                'attendance_stats_enabled',
                'attendance_advanced_stats_enabled'
            )
        `);
    }
}
