import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendAffiliatePartnerGambling1768800000002 implements MigrationInterface {
    name = 'ExtendAffiliatePartnerGambling1768800000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // partnerType enum + column
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "partner_type_enum" AS ENUM (
                    'TICKETING','HOSPITALITY','TRAVEL','PARKING','HOTEL','MERCHANDISE','GAMBLING','OTHER'
                );
            EXCEPTION WHEN duplicate_object THEN null;
            END $$
        `);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "partnerType" varchar(30) NOT NULL DEFAULT 'OTHER'`);

        // Campaign dates
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "campaignStartDate" TIMESTAMPTZ`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "campaignEndDate" TIMESTAMPTZ`);

        // Gambling compliance fields
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "minimumAge" INT`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "allowedCountries" TEXT`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "blockedCountries" TEXT`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "requiresUserConsent" BOOLEAN NOT NULL DEFAULT FALSE`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "requiresRGMessage" BOOLEAN NOT NULL DEFAULT FALSE`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "disclosureText" TEXT`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" ADD COLUMN IF NOT EXISTS "allowedPlacements" TEXT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "allowedPlacements"`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "disclosureText"`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "requiresRGMessage"`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "requiresUserConsent"`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "blockedCountries"`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "allowedCountries"`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "minimumAge"`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "campaignEndDate"`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "campaignStartDate"`);
        await queryRunner.query(`ALTER TABLE "affiliatePartner" DROP COLUMN IF EXISTS "partnerType"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "partner_type_enum"`);
    }
}
