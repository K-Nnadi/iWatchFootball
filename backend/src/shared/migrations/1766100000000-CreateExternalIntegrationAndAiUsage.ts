import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExternalIntegrationAndAiUsage1766100000000 implements MigrationInterface {
    name = 'CreateExternalIntegrationAndAiUsage1766100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
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
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_external_integration_one_default_llm"
            ON "externalIntegration" ("isDefault")
            WHERE "kind" = 'LLM' AND "isDefault" = true AND "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "aiUsageEvent" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "userId" integer,
                "externalIntegrationId" integer,
                "fixtureId" integer,
                "operation" character varying(64) NOT NULL,
                "inputTokens" integer,
                "outputTokens" integer,
                "estimatedUsd" decimal(18,8),
                "latencyMs" integer,
                "providerRequestId" character varying(128),
                "errorCode" character varying(64),
                CONSTRAINT "PK_ai_usage_event" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ai_usage_event_createdAt"
            ON "aiUsageEvent" ("createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ai_usage_event_user_created"
            ON "aiUsageEvent" ("userId", "createdAt")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ai_usage_event_integration"
            ON "aiUsageEvent" ("externalIntegrationId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "aiUsageEvent"`);
        await queryRunner.query(
            `DROP INDEX IF EXISTS "UQ_external_integration_one_default_llm"`,
        );
        await queryRunner.query(`DROP TABLE IF EXISTS "externalIntegration"`);
    }
}
