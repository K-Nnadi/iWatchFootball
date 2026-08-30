import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedIngestionConfig1768800000000 implements MigrationInterface {
    name = 'SeedIngestionConfig1768800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES (
                'live_fixture_sync_enabled',
                'boolean',
                true,
                'When true, the scheduled job polls API-Sports live fixtures every few minutes (requires Redis). Manual admin sync is always available.'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'live_fixture_sync_enabled'`);
    }
}
