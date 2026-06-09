import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedStripePaymentProcessor1767300000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "paymentProcessor"
            ALTER COLUMN "apiKey" DROP NOT NULL
        `);
        await queryRunner.query(`
            INSERT INTO "paymentProcessor" ("name", "slug", "type", "enabled", "logoUrl", "createdAt", "updatedAt")
            SELECT 'Stripe', 'stripe', 'CARD', true, '/logos/stripe.png', NOW(), NOW()
            WHERE NOT EXISTS (SELECT 1 FROM "paymentProcessor" WHERE "slug" = 'stripe')
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "paymentProcessor" WHERE "slug" = 'stripe'`);
    }
}
