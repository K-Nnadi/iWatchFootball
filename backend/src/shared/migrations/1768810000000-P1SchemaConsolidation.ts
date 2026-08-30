import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * P1 schema consolidation:
 * - Clear legacy paymentProcessor.apiKey (credentials live in integration.config)
 * - Extend ticket with status, source, activeListingId, and seat identity columns
 */
export class P1SchemaConsolidation1768810000000 implements MigrationInterface {
    name = 'P1SchemaConsolidation1768810000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- P1-1: paymentProcessor → integration ---

        // Move any legacy Stripe secret still stored on paymentProcessor into integration.config
        await queryRunner.query(`
            UPDATE "integration" i
            SET "config" = COALESCE(i."config", '{}'::jsonb)
                || CASE
                    WHEN pp."apiKey" IS NOT NULL AND btrim(pp."apiKey") <> ''
                         AND COALESCE(i."config"->>'secretKey', '') = ''
                    THEN jsonb_build_object('secretKey', pp."apiKey")
                    ELSE '{}'::jsonb
                END
                || CASE
                    WHEN pp."metadata" IS NOT NULL
                         AND pp."metadata"->>'publishableKey' IS NOT NULL
                         AND btrim(pp."metadata"->>'publishableKey') <> ''
                         AND COALESCE(i."config"->>'publishableKey', '') = ''
                    THEN jsonb_build_object('publishableKey', pp."metadata"->>'publishableKey')
                    ELSE '{}'::jsonb
                END
            FROM "paymentProcessor" pp
            WHERE pp."slug" = 'stripe'
              AND i."slug" = 'stripe-primary'
        `);

        await queryRunner.query(`
            UPDATE "paymentProcessor"
            SET "apiKey" = NULL
            WHERE "apiKey" IS NOT NULL
        `);

        // --- P1-2 / P1-3: ticket extensions ---

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "ticket_status_enum" AS ENUM ('AVAILABLE', 'LISTED', 'SOLD', 'TRANSFERRED');
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "ticket_source_enum" AS ENUM ('PRIMARY', 'RESALE', 'EXTERNAL');
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD COLUMN IF NOT EXISTS "status" "ticket_status_enum" NOT NULL DEFAULT 'AVAILABLE'
        `);

        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD COLUMN IF NOT EXISTS "source" "ticket_source_enum" NOT NULL DEFAULT 'PRIMARY'
        `);

        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD COLUMN IF NOT EXISTS "activeListingId" integer
        `);

        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD COLUMN IF NOT EXISTS "seatSection" varchar(100)
        `);

        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD COLUMN IF NOT EXISTS "seatBlock" varchar(50)
        `);

        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD COLUMN IF NOT EXISTS "seatRow" varchar(20)
        `);

        await queryRunner.query(`
            ALTER TABLE "ticket"
            ADD COLUMN IF NOT EXISTS "seatNumber" varchar(20)
        `);

        // Backfill LISTED tickets tied to active marketplace listings
        await queryRunner.query(`
            UPDATE "ticket" t
            SET
                "status" = 'LISTED',
                "activeListingId" = ml."id"
            FROM "marketplaceListing" ml
            WHERE ml."ticketId" = t."id"
              AND ml."status" = 'ACTIVE'
              AND ml."deletedAt" IS NULL
        `);

        // Backfill RESALE source from ownership history
        await queryRunner.query(`
            UPDATE "ticket" t
            SET "source" = 'RESALE'
            WHERE EXISTS (
                SELECT 1 FROM "ticketOwnershipHistory" toh
                WHERE toh."ticketId" = t."id"
                  AND toh."reason" = 'MARKETPLACE_SOLD'
                  AND toh."deletedAt" IS NULL
            )
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "ticket"
                ADD CONSTRAINT "FK_ticket_activeListing"
                FOREIGN KEY ("activeListingId") REFERENCES "marketplaceListing"("id")
                ON DELETE SET NULL ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ticket" DROP CONSTRAINT IF EXISTS "FK_ticket_activeListing"
        `);

        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN IF EXISTS "seatNumber"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN IF EXISTS "seatRow"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN IF EXISTS "seatBlock"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN IF EXISTS "seatSection"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN IF EXISTS "activeListingId"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN IF EXISTS "source"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP COLUMN IF EXISTS "status"`);

        await queryRunner.query(`DROP TYPE IF EXISTS "ticket_source_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "ticket_status_enum"`);
    }
}
