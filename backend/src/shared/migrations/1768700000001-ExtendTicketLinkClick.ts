import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendTicketLinkClick1768700000001 implements MigrationInterface {
    name = 'ExtendTicketLinkClick1768700000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ticketLinkClick"
            ADD COLUMN IF NOT EXISTS "source"     character varying(20) DEFAULT 'WEB',
            ADD COLUMN IF NOT EXISTS "fixtureId"  integer
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketLinkClick_fixtureId"
            ON "ticketLinkClick" ("fixtureId")
            WHERE "deletedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticketLinkClick_fixtureId"`);
        await queryRunner.query(`
            ALTER TABLE "ticketLinkClick"
            DROP COLUMN IF EXISTS "source",
            DROP COLUMN IF EXISTS "fixtureId"
        `);
    }
}
