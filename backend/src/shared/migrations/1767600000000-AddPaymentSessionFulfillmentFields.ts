import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentSessionFulfillmentFields1767600000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "paymentSession"
            ADD COLUMN IF NOT EXISTS "paymentId" integer,
            ADD COLUMN IF NOT EXISTS "fulfilledAt" TIMESTAMP WITH TIME ZONE
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_paymentSession_paymentId"
            ON "paymentSession" ("paymentId")
            WHERE "paymentId" IS NOT NULL
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paymentSession" DROP COLUMN IF EXISTS "fulfilledAt"`);
        await queryRunner.query(`ALTER TABLE "paymentSession" DROP COLUMN IF EXISTS "paymentId"`);
    }
}
