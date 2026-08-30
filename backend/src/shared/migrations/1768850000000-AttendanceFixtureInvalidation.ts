import { MigrationInterface, QueryRunner } from 'typeorm';

/** Flag attendance when a fixture is postponed/cancelled/suspended — do not delete the row. */
export class AttendanceFixtureInvalidation1768850000000 implements MigrationInterface {
    name = 'AttendanceFixtureInvalidation1768850000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "attendanceRecord"
            ADD COLUMN IF NOT EXISTS "fixtureInvalidatedAt" TIMESTAMP WITH TIME ZONE
        `);
        await queryRunner.query(`
            ALTER TABLE "attendanceRecord"
            ADD COLUMN IF NOT EXISTS "fixtureInvalidationReason" varchar(20)
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_attendanceRecord_fixture_active"
            ON "attendanceRecord" ("fixtureId")
            WHERE "deletedAt" IS NULL AND "fixtureInvalidatedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_attendanceRecord_fixture_active"`);
        await queryRunner.query(`
            ALTER TABLE "attendanceRecord"
            DROP COLUMN IF EXISTS "fixtureInvalidationReason"
        `);
        await queryRunner.query(`
            ALTER TABLE "attendanceRecord"
            DROP COLUMN IF EXISTS "fixtureInvalidatedAt"
        `);
    }
}
