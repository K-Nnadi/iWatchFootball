import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIntegration1766800000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "integration" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "slug" character varying(120) NOT NULL,
                "kind" character varying(32) NOT NULL,
                "provider" character varying(64) NOT NULL,
                "name" character varying(120) NOT NULL,
                "enabled" boolean NOT NULL DEFAULT false,
                "isDefault" boolean NOT NULL DEFAULT false,
                "config" jsonb,
                "description" character varying(500),
                CONSTRAINT "PK_integration" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_integration_slug" UNIQUE ("slug")
            )
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_integration_one_default_per_kind"
            ON "integration" ("kind")
            WHERE "isDefault" = true AND "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            INSERT INTO "integration" ("slug", "kind", "provider", "name", "enabled", "isDefault", "config", "description")
            VALUES (
                'stripe-primary',
                'PAYMENT',
                'stripe',
                'Stripe',
                false,
                true,
                '{"secretKey":"","publishableKey":"","webhookSecret":"","premiumMonthlyPriceId":""}'::jsonb,
                'Primary Stripe account — payment checkout and Premium subscriptions'
            )
            ON CONFLICT ("slug") DO NOTHING
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_integration_one_default_per_kind"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "integration"`);
    }
}
