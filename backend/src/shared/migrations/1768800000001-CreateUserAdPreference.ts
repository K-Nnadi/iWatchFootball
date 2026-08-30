import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAdPreference1768800000001 implements MigrationInterface {
    name = 'CreateUserAdPreference1768800000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "userAdPreference" (
                "id"               SERIAL PRIMARY KEY,
                "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
                "deletedAt"        TIMESTAMPTZ,
                "userId"           INT         NOT NULL,
                "showGamblingContent" BOOLEAN  NOT NULL DEFAULT FALSE,
                "consentGivenAt"   TIMESTAMPTZ,
                "selfExcluded"     BOOLEAN     NOT NULL DEFAULT FALSE,
                "selfExcludedAt"   TIMESTAMPTZ,
                CONSTRAINT "UQ_userAdPreference_userId" UNIQUE ("userId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userAdPreference_userId"
            ON "userAdPreference" ("userId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_userAdPreference_userId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "userAdPreference"`);
    }
}
