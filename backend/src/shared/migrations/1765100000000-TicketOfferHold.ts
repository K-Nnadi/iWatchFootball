import { MigrationInterface, QueryRunner } from 'typeorm';

export class TicketOfferHold1765100000000 implements MigrationInterface {
    name = 'TicketOfferHold1765100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ticket_offer_hold" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "fixtureId" integer NOT NULL,
                "offerKey" character varying(512) NOT NULL,
                "holderId" character varying(36) NOT NULL,
                "userId" integer NOT NULL,
                "quantity" integer NOT NULL DEFAULT 1,
                "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_ticket_offer_hold" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ticket_offer_hold_fixture_offer"
            ON "ticket_offer_hold" ("fixtureId", "offerKey")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticket_offer_hold_expires"
            ON "ticket_offer_hold" ("expiresAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "ticket_offer_hold"`);
    }
}
