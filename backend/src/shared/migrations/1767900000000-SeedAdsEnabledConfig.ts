import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdsEnabledConfig1767900000000 implements MigrationInterface {
    name = 'SeedAdsEnabledConfig1767900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES (
                'ads_enabled',
                'boolean',
                true,
                'When true, non-premium users see ad placements in the client UI'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'ads_enabled'`);
    }
}
