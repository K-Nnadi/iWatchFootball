import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Replaces the single `value varchar` column on platformConfig with a
 * discriminated union of typed value columns:
 *   valueType   – which column is active ('number' | 'string' | 'boolean' | 'array' | 'json')
 *   numberValue  – numeric(18,4)
 *   stringValue  – varchar(1000)
 *   booleanValue – boolean
 *   arrayValue   – jsonb
 *   jsonValue    – jsonb
 *
 * Existing rows are migrated:
 *   - 'marketplace_fee_rate' → valueType='number', numberValue=cast(value)
 *   - everything else        → valueType='string', stringValue=value
 */
export class AlterPlatformConfigValueTypes1766000000000 implements MigrationInterface {
    name = 'AlterPlatformConfigValueTypes1766000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns (nullable during migration)
        await queryRunner.query(`ALTER TABLE "platformConfig" ADD COLUMN IF NOT EXISTS "valueType"   varchar(20)`);
        await queryRunner.query(`ALTER TABLE "platformConfig" ADD COLUMN IF NOT EXISTS "numberValue"  numeric(18,4)`);
        await queryRunner.query(`ALTER TABLE "platformConfig" ADD COLUMN IF NOT EXISTS "stringValue"  varchar(1000)`);
        await queryRunner.query(`ALTER TABLE "platformConfig" ADD COLUMN IF NOT EXISTS "booleanValue" boolean`);
        await queryRunner.query(`ALTER TABLE "platformConfig" ADD COLUMN IF NOT EXISTS "arrayValue"   jsonb`);
        await queryRunner.query(`ALTER TABLE "platformConfig" ADD COLUMN IF NOT EXISTS "jsonValue"    jsonb`);

        // Migrate known numeric keys
        await queryRunner.query(`
            UPDATE "platformConfig"
            SET "valueType"  = 'number',
                "numberValue" = "value"::numeric
            WHERE "key" = 'marketplace_fee_rate'
        `);

        // All remaining rows default to string
        await queryRunner.query(`
            UPDATE "platformConfig"
            SET "valueType"   = 'string',
                "stringValue" = "value"
            WHERE "valueType" IS NULL
        `);

        // Make valueType NOT NULL now that every row has a value
        await queryRunner.query(`ALTER TABLE "platformConfig" ALTER COLUMN "valueType" SET NOT NULL`);

        // Drop the old generic value column
        await queryRunner.query(`ALTER TABLE "platformConfig" DROP COLUMN IF EXISTS "value"`);

        // Seed ticket_hold_minutes default (10 minutes)
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "numberValue", "description")
            VALUES (
                'ticket_hold_minutes',
                'number',
                10,
                'How long (in minutes) a ticket hold is reserved during checkout (1–60)'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "platformConfig" ADD COLUMN IF NOT EXISTS "value" varchar(500)`);

        await queryRunner.query(`
            UPDATE "platformConfig"
            SET "value" = "numberValue"::text
            WHERE "valueType" = 'number'
        `);
        await queryRunner.query(`
            UPDATE "platformConfig"
            SET "value" = "stringValue"
            WHERE "valueType" = 'string'
        `);
        await queryRunner.query(`
            UPDATE "platformConfig"
            SET "value" = "booleanValue"::text
            WHERE "valueType" = 'boolean'
        `);
        await queryRunner.query(`
            UPDATE "platformConfig"
            SET "value" = "arrayValue"::text
            WHERE "valueType" = 'array'
        `);
        await queryRunner.query(`
            UPDATE "platformConfig"
            SET "value" = "jsonValue"::text
            WHERE "valueType" = 'json'
        `);

        await queryRunner.query(`ALTER TABLE "platformConfig" ALTER COLUMN "value" SET NOT NULL`);

        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'ticket_hold_minutes'`);

        await queryRunner.query(`ALTER TABLE "platformConfig" DROP COLUMN IF EXISTS "valueType"`);
        await queryRunner.query(`ALTER TABLE "platformConfig" DROP COLUMN IF EXISTS "numberValue"`);
        await queryRunner.query(`ALTER TABLE "platformConfig" DROP COLUMN IF EXISTS "stringValue"`);
        await queryRunner.query(`ALTER TABLE "platformConfig" DROP COLUMN IF EXISTS "booleanValue"`);
        await queryRunner.query(`ALTER TABLE "platformConfig" DROP COLUMN IF EXISTS "arrayValue"`);
        await queryRunner.query(`ALTER TABLE "platformConfig" DROP COLUMN IF EXISTS "jsonValue"`);
    }
}
