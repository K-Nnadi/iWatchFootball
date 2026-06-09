import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentSession1767200000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "paymentSession" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "providerSlug" character varying(32) NOT NULL,
                "providerSessionId" character varying(255),
                "status" character varying(32) NOT NULL DEFAULT 'PENDING',
                "amount" numeric(18,2) NOT NULL,
                "currency" character varying(3) NOT NULL DEFAULT 'gbp',
                "checkoutContext" jsonb,
                "idempotencyKey" character varying(128),
                "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "providerPaymentRef" character varying(255),
                CONSTRAINT "PK_paymentSession" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_paymentSession_providerSessionId"
            ON "paymentSession" ("providerSessionId")
            WHERE "providerSessionId" IS NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_paymentSession_userId"
            ON "paymentSession" ("userId")
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "paymentSession"`);
    }
}
