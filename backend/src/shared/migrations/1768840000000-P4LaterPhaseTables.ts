import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * P4 later-phase and ops tables: seller profiles, escrow, trust scores, transfer details,
 * club rules, external ID mapping, email dispatch log, analytics rollups, GDPR deletion audit.
 */
export class P4LaterPhaseTables1768840000000 implements MigrationInterface {
    name = 'P4LaterPhaseTables1768840000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "anonymizedAt" TIMESTAMP WITH TIME ZONE
        `);

        // P4-1: sellerProfile
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "sellerProfile" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "stripeConnectAccountId" varchar(255),
                "stripeConnectOnboardingComplete" boolean NOT NULL DEFAULT false,
                "payoutsEnabled" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_sellerProfile" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_sellerProfile_userId" UNIQUE ("userId")
            )
        `);

        // P4-2: escrowHold
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "escrowHold" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "marketplaceTransactionId" integer NOT NULL,
                "amount" decimal(10, 2) NOT NULL,
                "currency" varchar(3) NOT NULL DEFAULT 'GBP',
                "status" varchar(20) NOT NULL,
                "heldAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "releasedAt" TIMESTAMP WITH TIME ZONE,
                "refundedAt" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_escrowHold" PRIMARY KEY ("id")
            )
        `);

        // P4-3: userTrustScore
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "userTrustScore" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "score" decimal(5, 2) NOT NULL DEFAULT 0,
                "ratingCount" integer NOT NULL DEFAULT 0,
                "disputeCount" integer NOT NULL DEFAULT 0,
                "computedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_userTrustScore" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_userTrustScore_userId" UNIQUE ("userId")
            )
        `);

        // P4-4: marketplaceTransferDetails
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "marketplaceTransferDetails" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "listingId" integer NOT NULL,
                "buyerUserId" integer NOT NULL,
                "encryptedPayload" text NOT NULL,
                "keyVersion" varchar(32) NOT NULL,
                CONSTRAINT "PK_marketplaceTransferDetails" PRIMARY KEY ("id")
            )
        `);

        // P4-5: clubTransferGuide
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "clubTransferGuide" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "teamId" integer NOT NULL,
                "content" text NOT NULL,
                "externalUrl" varchar(500),
                CONSTRAINT "PK_clubTransferGuide" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_clubTransferGuide_teamId" UNIQUE ("teamId")
            )
        `);

        // P4-6: officialInventorySnapshot
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "officialInventorySnapshot" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "fixtureId" integer NOT NULL,
                "providerSlug" varchar(64) NOT NULL,
                "availabilityJson" jsonb,
                "syncedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_officialInventorySnapshot" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_officialInventorySnapshot_fixture_provider"
            ON "officialInventorySnapshot" ("fixtureId", "providerSlug")
            WHERE "deletedAt" IS NULL
        `);

        // P4-7: clubTicketRule
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "clubTicketRule" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "teamId" integer NOT NULL,
                "resaleAllowed" boolean NOT NULL DEFAULT true,
                "maxResalePricePct" integer,
                "notes" varchar(500),
                "enforcedAt" varchar(20) NOT NULL DEFAULT 'NONE',
                CONSTRAINT "PK_clubTicketRule" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_clubTicketRule_teamId" UNIQUE ("teamId")
            )
        `);

        // P4-8: entityExternalId
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "entityExternalId" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "provider" varchar(64) NOT NULL,
                "entityType" varchar(32) NOT NULL,
                "localId" integer NOT NULL,
                "externalId" varchar(255) NOT NULL,
                CONSTRAINT "PK_entityExternalId" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_entityExternalId_provider_type_external"
            ON "entityExternalId" ("provider", "entityType", "externalId")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_entityExternalId_provider_type_local"
            ON "entityExternalId" ("provider", "entityType", "localId")
            WHERE "deletedAt" IS NULL
        `);

        // P4-9: emailDispatchLog
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "emailDispatchLog" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "templateKey" varchar(100) NOT NULL,
                "status" varchar(20) NOT NULL,
                "providerMessageId" varchar(255),
                "error" varchar(500),
                CONSTRAINT "PK_emailDispatchLog" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_emailDispatchLog_userId_createdAt"
            ON "emailDispatchLog" ("userId", "createdAt")
            WHERE "deletedAt" IS NULL
        `);

        // P4-10: analytics rollups
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ticketLinkClickDaily" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "day" date NOT NULL,
                "fixtureId" integer,
                "ticketLinkId" integer,
                "clickCount" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_ticketLinkClickDaily" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ticketLinkClickDaily_day_fixture_link"
            ON "ticketLinkClickDaily" ("day", "fixtureId", "ticketLinkId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ticketInterestDaily" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "day" date NOT NULL,
                "fixtureId" integer,
                "activeCount" integer NOT NULL DEFAULT 0,
                "notifiedCount" integer NOT NULL DEFAULT 0,
                CONSTRAINT "PK_ticketInterestDaily" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ticketInterestDaily_day_fixture"
            ON "ticketInterestDaily" ("day", "fixtureId")
            WHERE "deletedAt" IS NULL
        `);

        // P4-11: userDeletionRequest (GDPR audit)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "userDeletionRequest" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "requestedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "completedAt" TIMESTAMP WITH TIME ZONE,
                "notes" varchar(500),
                CONSTRAINT "PK_userDeletionRequest" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "userDeletionRequest"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_ticketInterestDaily_day_fixture"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ticketInterestDaily"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_ticketLinkClickDaily_day_fixture_link"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ticketLinkClickDaily"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_emailDispatchLog_userId_createdAt"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "emailDispatchLog"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_entityExternalId_provider_type_local"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_entityExternalId_provider_type_external"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "entityExternalId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "clubTicketRule"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_officialInventorySnapshot_fixture_provider"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "officialInventorySnapshot"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "clubTransferGuide"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "marketplaceTransferDetails"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "userTrustScore"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "escrowHold"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sellerProfile"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "anonymizedAt"`);
    }
}
