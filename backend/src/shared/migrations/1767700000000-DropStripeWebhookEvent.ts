import { MigrationInterface, QueryRunner } from 'typeorm';

/** Removes stripeWebhookEvent table — idempotency uses paymentSession + payment metadata instead. */
export class DropStripeWebhookEvent1767700000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "stripeWebhookEvent"`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "stripeWebhookEvent" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "stripeEventId" character varying(255) NOT NULL,
                "type" character varying(128) NOT NULL,
                "status" character varying(32) NOT NULL DEFAULT 'RECEIVED',
                "paymentSessionId" integer,
                "errorMessage" text,
                "processedAt" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_stripeWebhookEvent" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_stripeWebhookEvent_stripeEventId" UNIQUE ("stripeEventId")
            )
        `);
    }
}
