import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendMarketplaceListingPhase41768640000000 implements MigrationInterface {
    name = 'ExtendMarketplaceListingPhase41768640000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "marketplace_listing_status_enum_new" AS ENUM (
                    'DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'SOLD', 'CANCELLED', 'EXPIRED'
                );
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "ticket_type_enum" AS ENUM ('PHYSICAL', 'PDF', 'MOBILE_APP', 'CLUB_TRANSFER');
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "delivery_method_enum" AS ENUM ('EMAIL_PDF', 'CLUB_APP_TRANSFER', 'PHYSICAL_POST', 'IN_PERSON');
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        // Rename old status enum column temporarily
        await queryRunner.query(`
            ALTER TABLE "marketplaceListing"
            ADD COLUMN IF NOT EXISTS "statusNew" "marketplace_listing_status_enum_new"
        `);
        await queryRunner.query(`
            UPDATE "marketplaceListing"
            SET "statusNew" = "status"::text::"marketplace_listing_status_enum_new"
        `);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`
            ALTER TABLE "marketplaceListing"
            RENAME COLUMN "statusNew" TO "status"
        `);
        await queryRunner.query(`
            ALTER TABLE "marketplaceListing"
            ALTER COLUMN "status" SET NOT NULL,
            ALTER COLUMN "status" SET DEFAULT 'DRAFT'
        `);

        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "ticketType" "ticket_type_enum"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "deliveryMethod" "delivery_method_enum"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "quantity" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "description" varchar(300)`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "seatSection" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "seatBlock" varchar(50)`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "seatRow" varchar(20)`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "seatNumber" varchar(20)`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "proofDocumentPath" varchar(1000)`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "rejectionReason" varchar(500)`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "buyerId" integer`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "transferInitiatedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "transferConfirmedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "receiptConfirmedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "snapshotBuyerFeeRate" decimal(5, 4)`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" ADD COLUMN IF NOT EXISTS "snapshotSellerFeeRate" decimal(5, 4)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "ticketType"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "deliveryMethod"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "quantity"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "description"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "seatSection"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "seatBlock"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "seatRow"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "seatNumber"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "proofDocumentPath"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "rejectionReason"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "buyerId"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "transferInitiatedAt"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "transferConfirmedAt"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "receiptConfirmedAt"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "snapshotBuyerFeeRate"`);
        await queryRunner.query(`ALTER TABLE "marketplaceListing" DROP COLUMN IF EXISTS "snapshotSellerFeeRate"`);
    }
}
