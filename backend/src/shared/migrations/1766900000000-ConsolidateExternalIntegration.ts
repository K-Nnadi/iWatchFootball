import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Merges legacy externalIntegration rows into integration and drops the old table.
 */
export class ConsolidateExternalIntegration1766900000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        const hasLegacy = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables
                WHERE table_name = 'externalIntegration'
            ) AS exists
        `);
        if (!hasLegacy[0]?.exists) {
            return;
        }

        await queryRunner.query(`
            INSERT INTO "integration" (
                "slug", "kind", "provider", "name", "enabled", "isDefault", "config", "description", "createdAt", "updatedAt"
            )
            SELECT
                ei."slug",
                ei."kind",
                ei."provider",
                COALESCE(NULLIF(ei."description", ''), ei."slug"),
                ei."enabled",
                ei."isDefault",
                COALESCE(ei."config", '{}'::jsonb)
                    || CASE WHEN ei."baseUrl" IS NOT NULL THEN jsonb_build_object('baseUrl', ei."baseUrl") ELSE '{}'::jsonb END
                    || jsonb_build_object('authType', ei."authType")
                    || CASE WHEN ei."secretRef" IS NOT NULL THEN jsonb_build_object('secretRef', ei."secretRef") ELSE '{}'::jsonb END,
                ei."description",
                ei."createdAt",
                ei."updatedAt"
            FROM "externalIntegration" ei
            WHERE NOT EXISTS (
                SELECT 1 FROM "integration" i WHERE i."slug" = ei."slug"
            )
        `);

        await queryRunner.query(`
            UPDATE "integration" i
            SET
                "kind" = ei."kind",
                "provider" = ei."provider",
                "enabled" = ei."enabled",
                "isDefault" = ei."isDefault",
                "description" = COALESCE(ei."description", i."description"),
                "config" = COALESCE(i."config", '{}'::jsonb)
                    || COALESCE(ei."config", '{}'::jsonb)
                    || CASE WHEN ei."baseUrl" IS NOT NULL THEN jsonb_build_object('baseUrl', ei."baseUrl") ELSE '{}'::jsonb END
                    || jsonb_build_object('authType', ei."authType")
                    || CASE WHEN ei."secretRef" IS NOT NULL THEN jsonb_build_object('secretRef', ei."secretRef") ELSE '{}'::jsonb END
            FROM "externalIntegration" ei
            WHERE i."slug" = ei."slug"
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'aiUsageEvent' AND column_name = 'externalIntegrationId'
                ) THEN
                    ALTER TABLE "aiUsageEvent" RENAME COLUMN "externalIntegrationId" TO "integrationId";
                END IF;
            END $$;
        `);

        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_external_integration_one_default_llm"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "externalIntegration"`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "externalIntegration" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "slug" character varying(120) NOT NULL,
                "kind" character varying(32) NOT NULL,
                "provider" character varying(32) NOT NULL,
                "baseUrl" character varying(512),
                "authType" character varying(32) NOT NULL,
                "secretRef" character varying(128),
                "config" jsonb,
                "enabled" boolean NOT NULL DEFAULT true,
                "isDefault" boolean NOT NULL DEFAULT false,
                "description" character varying(500),
                CONSTRAINT "PK_external_integration" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_external_integration_slug" UNIQUE ("slug")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "aiUsageEvent"
            RENAME COLUMN "integrationId" TO "externalIntegrationId"
        `);
    }
}
