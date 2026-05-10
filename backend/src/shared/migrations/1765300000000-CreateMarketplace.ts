import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMarketplace1765300000000 implements MigrationInterface {
    name = 'CreateMarketplace1765300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "marketplace_listing" (
                "id"         SERIAL NOT NULL,
                "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt"  TIMESTAMP,
                "metadata"   jsonb,
                "ticketId"   integer NOT NULL,
                "sellerId"   integer NOT NULL,
                "askPrice"   numeric(10,2) NOT NULL,
                "status"     character varying(20) NOT NULL DEFAULT 'ACTIVE',
                "expiresAt"  TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_marketplace_listing" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_marketplace_listing_status"
            ON "marketplace_listing" ("status")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_marketplace_listing_seller"
            ON "marketplace_listing" ("sellerId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_marketplace_listing_expires"
            ON "marketplace_listing" ("expiresAt")
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "marketplace_transaction" (
                "id"             SERIAL NOT NULL,
                "createdAt"      TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt"      TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt"      TIMESTAMP,
                "metadata"       jsonb,
                "listingId"      integer NOT NULL,
                "buyerId"        integer NOT NULL,
                "buyerPaymentId" integer NOT NULL,
                "salePrice"      numeric(10,2) NOT NULL,
                "adminFee"       numeric(10,2) NOT NULL,
                "adminFeeRate"   numeric(5,4) NOT NULL,
                "sellerCreditId" integer,
                CONSTRAINT "PK_marketplace_transaction" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_marketplace_transaction_buyer"
            ON "marketplace_transaction" ("buyerId")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_marketplace_transaction_listing"
            ON "marketplace_transaction" ("listingId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "marketplace_transaction"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_marketplace_listing_expires"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_marketplace_listing_seller"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_marketplace_listing_status"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "marketplace_listing"`);
    }
}
