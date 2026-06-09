import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMarketplaceEnabledConfig1767400000000 implements MigrationInterface {
    name = 'SeedMarketplaceEnabledConfig1767400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES (
                'marketplace_enabled',
                'boolean',
                false,
                'When true, marketplace listing and checkout endpoints are available and the UI shows marketplace navigation'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'marketplace_enabled'`);
    }
}
