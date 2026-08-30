import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * P3 phase-aligned schema additions: ticketLink health fields, sponsored placements,
 * analytics events, marketplace disputes, userRating transaction FK, paymentSession marketplace fields.
 */
export class P3SchemaAdditions1768830000000 implements MigrationInterface {
    name = 'P3SchemaAdditions1768830000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // P3-1: ticketLink health and verified fields
        await queryRunner.query(`
            ALTER TABLE "ticketLink"
            ADD COLUMN IF NOT EXISTS "isVerifiedOfficial" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "ticketLink"
            ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true
        `);
        await queryRunner.query(`
            ALTER TABLE "ticketLink"
            ADD COLUMN IF NOT EXISTS "isHealthy" boolean NOT NULL DEFAULT true
        `);
        await queryRunner.query(`
            ALTER TABLE "ticketLink"
            ADD COLUMN IF NOT EXISTS "lastHealthCheckAt" TIMESTAMP WITH TIME ZONE
        `);
        await queryRunner.query(`
            ALTER TABLE "ticketLink"
            ADD COLUMN IF NOT EXISTS "healthCheckError" varchar(500)
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "ticketLink"
                ADD CONSTRAINT "FK_ticketLink_partner"
                FOREIGN KEY ("partnerId") REFERENCES "affiliatePartner"("id")
                ON DELETE SET NULL ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        // P3-2: sponsoredPlacement
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "sponsoredPlacement" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "linkId" integer NOT NULL,
                "fixtureId" integer,
                "teamId" integer,
                "competitionId" integer,
                "isGlobal" boolean NOT NULL DEFAULT false,
                "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
                "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
                "impressionTarget" integer,
                "impressionCount" integer NOT NULL DEFAULT 0,
                "notes" varchar(500),
                CONSTRAINT "PK_sponsoredPlacement" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "sponsoredPlacement"
                ADD CONSTRAINT "FK_sponsoredPlacement_link"
                FOREIGN KEY ("linkId") REFERENCES "ticketLink"("id")
                ON DELETE CASCADE ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        // P3-3: analyticsEvent
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "analyticsEvent" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "eventType" varchar(40) NOT NULL,
                "fixtureId" integer,
                "ticketLinkId" integer,
                "userId" integer,
                "source" varchar(10),
                CONSTRAINT "PK_analyticsEvent" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_analyticsEvent_fixtureId_createdAt"
            ON "analyticsEvent" ("fixtureId", "createdAt")
            WHERE "deletedAt" IS NULL
        `);

        // P3-8: marketplaceDispute
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "marketplaceDispute" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "listingId" integer NOT NULL,
                "marketplaceTransactionId" integer,
                "raisedByUserId" integer NOT NULL,
                "reason" varchar(200) NOT NULL,
                "details" varchar(1000) NOT NULL,
                "status" varchar(20) NOT NULL DEFAULT 'OPEN',
                "resolvedAt" TIMESTAMP WITH TIME ZONE,
                "resolvedByUserId" integer,
                "resolutionNotes" varchar(1000),
                CONSTRAINT "PK_marketplaceDispute" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "marketplaceDispute"
                ADD CONSTRAINT "FK_marketplaceDispute_listing"
                FOREIGN KEY ("listingId") REFERENCES "marketplaceListing"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        // P3-9: userRating marketplaceTransactionId
        await queryRunner.query(`
            ALTER TABLE "userRating"
            ADD COLUMN IF NOT EXISTS "marketplaceTransactionId" integer
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_userRating_transaction_rater"
            ON "userRating" ("marketplaceTransactionId", "raterUserId")
            WHERE "marketplaceTransactionId" IS NOT NULL AND "deletedAt" IS NULL
        `);

        // P3-10: paymentSession marketplace traceability
        await queryRunner.query(`
            ALTER TABLE "paymentSession"
            ADD COLUMN IF NOT EXISTS "listingId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "paymentSession"
            ADD COLUMN IF NOT EXISTS "marketplaceTransactionId" integer
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paymentSession" DROP COLUMN IF EXISTS "marketplaceTransactionId"`);
        await queryRunner.query(`ALTER TABLE "paymentSession" DROP COLUMN IF EXISTS "listingId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_userRating_transaction_rater"`);
        await queryRunner.query(`ALTER TABLE "userRating" DROP COLUMN IF EXISTS "marketplaceTransactionId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "marketplaceDispute"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_analyticsEvent_fixtureId_createdAt"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "analyticsEvent"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sponsoredPlacement"`);
        await queryRunner.query(`ALTER TABLE "ticketLink" DROP CONSTRAINT IF EXISTS "FK_ticketLink_partner"`);
        await queryRunner.query(`ALTER TABLE "ticketLink" DROP COLUMN IF EXISTS "healthCheckError"`);
        await queryRunner.query(`ALTER TABLE "ticketLink" DROP COLUMN IF EXISTS "lastHealthCheckAt"`);
        await queryRunner.query(`ALTER TABLE "ticketLink" DROP COLUMN IF EXISTS "isHealthy"`);
        await queryRunner.query(`ALTER TABLE "ticketLink" DROP COLUMN IF EXISTS "isActive"`);
        await queryRunner.query(`ALTER TABLE "ticketLink" DROP COLUMN IF EXISTS "isVerifiedOfficial"`);
    }
}
