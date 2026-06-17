import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueLogUserFixture1768200000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        // Keep one row per (user, fixture): prefer verified, then oldest id.
        await queryRunner.query(`
            WITH ranked AS (
                SELECT id,
                    ROW_NUMBER() OVER (
                        PARTITION BY "userId", "fixtureId"
                        ORDER BY "isVerified" DESC, id ASC
                    ) AS rn
                FROM "log"
                WHERE "deletedAt" IS NULL
            )
            DELETE FROM "log"
            WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_log_userId_fixtureId_active"
            ON "log" ("userId", "fixtureId")
            WHERE "deletedAt" IS NULL
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "UQ_log_userId_fixtureId_active"`);
    }
}
