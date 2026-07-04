import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTicketLinksConfig1767600000000 implements MigrationInterface {
    name = 'SeedTicketLinksConfig1767600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES (
                'ticket_links_enabled',
                'boolean',
                false,
                'When true, external ticket link CTAs are shown on match and team pages'
            )
            ON CONFLICT ("key") DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES (
                'affiliate_links_enabled',
                'boolean',
                false,
                'When true, affiliate tracking tags are appended to ticket links for tracked partners'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'affiliate_links_enabled'`);
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'ticket_links_enabled'`);
    }
}
