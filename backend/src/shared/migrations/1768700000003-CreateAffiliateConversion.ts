import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAffiliateConversion1768700000003 implements MigrationInterface {
    name = 'CreateAffiliateConversion1768700000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "affiliateConversion" (
                "id"               SERIAL NOT NULL,
                "createdAt"        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt"        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt"        TIMESTAMP WITH TIME ZONE,
                "metadata"         jsonb,
                "ticketLinkId"     integer NOT NULL,
                "userId"           integer,
                "commissionAmount" numeric(10,2),
                "currency"         character varying(10),
                "orderId"          character varying(255),
                "network"          character varying(100) NOT NULL,
                "rawPayload"       jsonb,
                CONSTRAINT "PK_affiliateConversion" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_affiliateConversion_ticketLinkId"
            ON "affiliateConversion" ("ticketLinkId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_affiliateConversion_ticketLinkId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "affiliateConversion"`);
    }
}
