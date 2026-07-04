import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendTicketLinkModel1768700000000 implements MigrationInterface {
    name = 'ExtendTicketLinkModel1768700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ticketLink"
            ADD COLUMN IF NOT EXISTS "isSponsored"         boolean NOT NULL DEFAULT false,
            ADD COLUMN IF NOT EXISTS "sponsorLabel"        character varying(200),
            ADD COLUMN IF NOT EXISTS "affiliateUrlFormat"  character varying(30),
            ADD COLUMN IF NOT EXISTS "partnerId"           integer,
            ADD COLUMN IF NOT EXISTS "saleInfo"            jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ticketLink"
            DROP COLUMN IF EXISTS "isSponsored",
            DROP COLUMN IF EXISTS "sponsorLabel",
            DROP COLUMN IF EXISTS "affiliateUrlFormat",
            DROP COLUMN IF EXISTS "partnerId",
            DROP COLUMN IF EXISTS "saleInfo"
        `);
    }
}
