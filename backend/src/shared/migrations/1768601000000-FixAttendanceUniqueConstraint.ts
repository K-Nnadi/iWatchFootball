import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Replaces the table-level UNIQUE constraint on attendanceRecord(userId, fixtureId)
 * with a partial unique index that ignores soft-deleted rows.
 *
 * Without this, a user who cancels attendance and then tries to re-register gets a
 * unique constraint violation (→ 500) because the soft-deleted row still occupies
 * the uniqueness slot.
 */
export class FixAttendanceUniqueConstraint1768601000000 implements MigrationInterface {
    name = 'FixAttendanceUniqueConstraint1768601000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the table-level constraint (ignores deleted rows via WHERE clause below)
        await queryRunner.query(`
            ALTER TABLE "attendanceRecord"
            DROP CONSTRAINT IF EXISTS "UQ_attendanceRecord_user_fixture"
        `);

        // Partial unique index — only enforced for active (non-deleted) records
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_attendanceRecord_user_fixture_active"
            ON "attendanceRecord" ("userId", "fixtureId")
            WHERE "deletedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "UQ_attendanceRecord_user_fixture_active"
        `);

        await queryRunner.query(`
            ALTER TABLE "attendanceRecord"
            ADD CONSTRAINT "UQ_attendanceRecord_user_fixture"
            UNIQUE ("userId", "fixtureId")
        `);
    }
}
