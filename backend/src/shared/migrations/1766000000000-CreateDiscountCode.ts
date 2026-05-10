import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDiscountCode1766000000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "discountCode" (
                id                  SERIAL PRIMARY KEY,
                "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
                "deletedAt"         TIMESTAMPTZ,
                metadata            JSONB,
                code                VARCHAR(50) NOT NULL,
                type                VARCHAR(20) NOT NULL,
                value               DECIMAL(10, 2) NOT NULL,
                active              BOOLEAN NOT NULL DEFAULT true,
                "maxUsesPerUser"    INT NOT NULL DEFAULT 1,
                "expiresAt"         TIMESTAMPTZ,
                "totalUsesCount"    INT NOT NULL DEFAULT 0,
                CONSTRAINT uq_discount_code UNIQUE (code)
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "discountCodeUsage" (
                id                  SERIAL PRIMARY KEY,
                "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
                "deletedAt"         TIMESTAMPTZ,
                metadata            JSONB,
                "discountCodeId"    INT NOT NULL REFERENCES "discountCode"(id),
                "userId"            INT NOT NULL,
                "paymentId"         INT,
                "discountAmount"    DECIMAL(10, 2) NOT NULL,
                CONSTRAINT uq_discount_code_usage UNIQUE ("discountCodeId", "userId")
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_discount_code_usage_user ON "discountCodeUsage" ("userId");
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "discountCodeUsage";`);
        await queryRunner.query(`DROP TABLE IF EXISTS "discountCode";`);
    }
}
