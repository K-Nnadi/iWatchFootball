import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * P0 schema integrity fixes:
 * 1. fixture.competitionId — repoint FK from teamCompetitionSeason.id to competition.id
 * 2. fixture.seasonId — add FK to season.id
 * 3. user.commsPreferenceId — drop redundant column (commsPreference.userId is canonical)
 */
export class FixP0SchemaIntegrity1768800000000 implements MigrationInterface {
    name = 'FixP0SchemaIntegrity1768800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- P0-1: fixture competition/season FKs ---

        // Drop the incorrect FK (competitionId → teamCompetitionSeason.id) if present
        await queryRunner.query(`
            ALTER TABLE "fixture"
            DROP CONSTRAINT IF EXISTS "FK_25bc22fb71d6d3fab52eed0fbed"
        `);

        // Backfill rows where competitionId accidentally stores a teamCompetitionSeason.id
        await queryRunner.query(`
            UPDATE "fixture" f
            SET
                "competitionId" = tcs."competitionId",
                "seasonId" = tcs."seasonId"
            FROM "teamCompetitionSeason" tcs
            WHERE f."competitionId" = tcs."id"
              AND NOT EXISTS (
                  SELECT 1 FROM "competition" c
                  WHERE c."id" = f."competitionId"
                    AND c."deletedAt" IS NULL
              )
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "fixture"
                ADD CONSTRAINT "FK_fixture_competition"
                FOREIGN KEY ("competitionId") REFERENCES "competition"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "fixture"
                ADD CONSTRAINT "FK_fixture_season"
                FOREIGN KEY ("seasonId") REFERENCES "season"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        // --- P0-3: user ↔ commsPreference ---

        await queryRunner.query(`
            ALTER TABLE "user"
            DROP COLUMN IF EXISTS "commsPreferenceId"
        `);

        // Enforce one comms preference row per user (partial index ignores soft-deleted rows)
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_commsPreference_userId_active"
            ON "commsPreference" ("userId")
            WHERE "deletedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "UQ_commsPreference_userId_active"
        `);

        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "commsPreferenceId" integer
        `);

        await queryRunner.query(`
            UPDATE "user" u
            SET "commsPreferenceId" = cp."id"
            FROM "commsPreference" cp
            WHERE cp."userId" = u."id"
              AND cp."deletedAt" IS NULL
              AND u."commsPreferenceId" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "fixture"
            DROP CONSTRAINT IF EXISTS "FK_fixture_season"
        `);

        await queryRunner.query(`
            ALTER TABLE "fixture"
            DROP CONSTRAINT IF EXISTS "FK_fixture_competition"
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "fixture"
                ADD CONSTRAINT "FK_25bc22fb71d6d3fab52eed0fbed"
                FOREIGN KEY ("competitionId") REFERENCES "teamCompetitionSeason"("id")
                ON DELETE NO ACTION ON UPDATE NO ACTION;
            EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);
    }
}
