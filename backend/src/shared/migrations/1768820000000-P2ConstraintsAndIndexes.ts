import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * P2 constraints and indexes — partial uniques, analytics indexes, FK additions.
 */
export class P2ConstraintsAndIndexes1768820000000 implements MigrationInterface {
    name = 'P2ConstraintsAndIndexes1768820000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // P2-1: one active ticket interest per user per fixture
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ticketInterest_user_fixture_active"
            ON "ticketInterest" ("userId", "fixtureId")
            WHERE "status" = 'ACTIVE' AND "deletedAt" IS NULL
        `);

        // P2-2: affiliate postback deduplication
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_affiliateConversion_network_orderId"
            ON "affiliateConversion" ("network", "orderId")
            WHERE "orderId" IS NOT NULL AND "deletedAt" IS NULL
        `);

        // P2-3: friend connection dedup (normalized pair)
        await queryRunner.query(`
            ALTER TABLE "userConnection"
            DROP CONSTRAINT IF EXISTS "UQ_userConnection_pair"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_userConnection_pair_active"
            ON "userConnection" (
                LEAST("requesterId", "addresseeId"),
                GREATEST("requesterId", "addresseeId")
            )
            WHERE "deletedAt" IS NULL
        `);

        // P2-4: one active listing per ticket
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_marketplaceListing_ticketId_active"
            ON "marketplaceListing" ("ticketId")
            WHERE "status" = 'ACTIVE' AND "deletedAt" IS NULL
        `);

        // P2-5: denormalize fixtureId on listing for seat dedup index
        await queryRunner.query(`
            ALTER TABLE "marketplaceListing"
            ADD COLUMN IF NOT EXISTS "fixtureId" integer
        `);
        await queryRunner.query(`
            UPDATE "marketplaceListing" ml
            SET "fixtureId" = t."fixtureId"
            FROM "ticket" t
            WHERE ml."ticketId" = t."id"
              AND ml."fixtureId" IS NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_marketplaceListing_fixture_seat_active"
            ON "marketplaceListing" ("fixtureId", "seatSection", "seatRow", "seatNumber")
            WHERE "status" = 'ACTIVE'
              AND "deletedAt" IS NULL
              AND "seatRow" IS NOT NULL
              AND "seatNumber" IS NOT NULL
        `);

        // P2-6: click analytics by fixture + time
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketLinkClick_fixtureId_createdAt"
            ON "ticketLinkClick" ("fixtureId", "createdAt")
            WHERE "deletedAt" IS NULL
        `);

        // P2-7: active hold per offer (expiry handled by app cleanup; no NOW() in index)
        // UQ_ticket_hold_fixture_offer already exists from legacy migration — ensure present
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_ticket_hold_fixture_offer"
            ON "ticketHold" ("fixtureId", "offerKey")
            WHERE "deletedAt" IS NULL
        `);

        // P2-8: FK additions on ticketing tables
        const fks: Array<[string, string, string, string]> = [
            ['ticketInterest', 'FK_ticketInterest_user', 'userId', 'user'],
            ['ticketInterest', 'FK_ticketInterest_fixture', 'fixtureId', 'fixture'],
            ['attendanceRecord', 'FK_attendanceRecord_user', 'userId', 'user'],
            ['attendanceRecord', 'FK_attendanceRecord_fixture', 'fixtureId', 'fixture'],
            ['ticketLinkClick', 'FK_ticketLinkClick_ticketLink', 'ticketLinkId', 'ticketLink'],
            ['affiliateConversion', 'FK_affiliateConversion_ticketLink', 'ticketLinkId', 'ticketLink'],
            ['marketplaceListing', 'FK_marketplaceListing_ticket', 'ticketId', 'ticket'],
            ['marketplaceListing', 'FK_marketplaceListing_seller', 'sellerId', 'user'],
            ['marketplaceListing', 'FK_marketplaceListing_fixture', 'fixtureId', 'fixture'],
        ];

        for (const [table, name, column, refTable] of fks) {
            await queryRunner.query(`
                DO $$ BEGIN
                    ALTER TABLE "${table}"
                    ADD CONSTRAINT "${name}"
                    FOREIGN KEY ("${column}") REFERENCES "${refTable}"("id")
                    ON DELETE NO ACTION ON UPDATE NO ACTION;
                EXCEPTION WHEN duplicate_object THEN null;
                END $$;
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP CONSTRAINT IF EXISTS "FK_marketplaceListing_fixture"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP CONSTRAINT IF EXISTS "FK_marketplaceListing_seller"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP CONSTRAINT IF EXISTS "FK_marketplaceListing_ticket"`);
        await queryRunner.query(`ALTER TABLE "affiliateConversion" DROP CONSTRAINT IF EXISTS "FK_affiliateConversion_ticketLink"`);
        await queryRunner.query(`ALTER TABLE "ticketLinkClick" DROP CONSTRAINT IF EXISTS "FK_ticketLinkClick_ticketLink"`);
        await queryRunner.query(`ALTER TABLE "attendanceRecord" DROP CONSTRAINT IF EXISTS "FK_attendanceRecord_fixture"`);
        await queryRunner.query(`ALTER TABLE "attendanceRecord" DROP CONSTRAINT IF EXISTS "FK_attendanceRecord_user"`);
        await queryRunner.query(`ALTER TABLE "ticketInterest" DROP CONSTRAINT IF EXISTS "FK_ticketInterest_fixture"`);
        await queryRunner.query(`ALTER TABLE "ticketInterest" DROP CONSTRAINT IF EXISTS "FK_ticketInterest_user"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_ticket_hold_fixture_offer"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticketLinkClick_fixtureId_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_marketplaceListing_fixture_seat_active"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "fixtureId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_marketplaceListing_ticketId_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_userConnection_pair_active"`);
        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "userConnection"
                ADD CONSTRAINT "UQ_userConnection_pair" UNIQUE ("requesterId", "addresseeId");
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_affiliateConversion_network_orderId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_ticketInterest_user_fixture_active"`);
    }
}
