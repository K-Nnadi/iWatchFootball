import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketLinkCategory1767701000000 implements MigrationInterface {
    name = 'AddTicketLinkCategory1767701000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ticketLink"
            ADD COLUMN IF NOT EXISTS "linkCategory" character varying(30) NOT NULL DEFAULT 'TICKETS'
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketLink_category"
            ON "ticketLink" ("linkCategory")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES (
                'matchday_affiliates_enabled',
                'boolean',
                false,
                'When true, the Matchday Planning section (travel, hotels, parking) is shown on match pages'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'matchday_affiliates_enabled'`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticketLink_category"`);
        await queryRunner.query(`ALTER TABLE "ticketLink" DROP COLUMN IF EXISTS "linkCategory"`);
    }
}
