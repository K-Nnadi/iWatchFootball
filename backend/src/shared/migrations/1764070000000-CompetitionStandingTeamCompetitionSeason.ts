import { MigrationInterface, QueryRunner } from "typeorm";

export class CompetitionStandingTeamCompetitionSeason1764070000000 implements MigrationInterface {
  name = "CompetitionStandingTeamCompetitionSeason1764070000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasStanding = await queryRunner.hasTable("competitionStanding");
    const hasTcs = await queryRunner.hasTable("teamCompetitionSeason");
    if (!hasStanding || !hasTcs) return;

    // 1) Ensure join table cannot duplicate (team, competition, season)
    // Use IF NOT EXISTS so it is safe to run on existing envs.
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_teamCompetitionSeason_team_comp_season'
        ) THEN
          ALTER TABLE "teamCompetitionSeason"
            ADD CONSTRAINT "UQ_teamCompetitionSeason_team_comp_season"
            UNIQUE ("teamId", "competitionId", "seasonId");
        END IF;
      END $$;
    `);

    // 2) Add new FK column to standings
    await queryRunner.query(`
      ALTER TABLE "competitionStanding"
      ADD COLUMN IF NOT EXISTS "teamCompetitionSeasonId" integer
    `);

    // 3) Backfill missing join rows (idempotent)
    await queryRunner.query(`
      INSERT INTO "teamCompetitionSeason" ("teamId", "competitionId", "seasonId", "createdAt", "updatedAt")
      SELECT DISTINCT cs."teamId", cs."competitionId", cs."seasonId", now(), now()
      FROM "competitionStanding" cs
      WHERE cs."teamId" IS NOT NULL AND cs."competitionId" IS NOT NULL AND cs."seasonId" IS NOT NULL
      ON CONFLICT ON CONSTRAINT "UQ_teamCompetitionSeason_team_comp_season" DO NOTHING
    `);

    // 4) Backfill standings.teamCompetitionSeasonId from the join table
    await queryRunner.query(`
      UPDATE "competitionStanding" cs
      SET "teamCompetitionSeasonId" = tcs."id"
      FROM "teamCompetitionSeason" tcs
      WHERE cs."teamCompetitionSeasonId" IS NULL
        AND tcs."teamId" = cs."teamId"
        AND tcs."competitionId" = cs."competitionId"
        AND tcs."seasonId" = cs."seasonId"
    `);

    // 5) Enforce non-null & FK
    await queryRunner.query(`
      ALTER TABLE "competitionStanding"
      ALTER COLUMN "teamCompetitionSeasonId" SET NOT NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_competitionStanding_teamCompetitionSeason'
        ) THEN
          ALTER TABLE "competitionStanding"
            ADD CONSTRAINT "FK_competitionStanding_teamCompetitionSeason"
            FOREIGN KEY ("teamCompetitionSeasonId") REFERENCES "teamCompetitionSeason"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // 6) Drop the denormalized columns from standings
    await queryRunner.query(`ALTER TABLE "competitionStanding" DROP COLUMN IF EXISTS "competitionId"`);
    await queryRunner.query(`ALTER TABLE "competitionStanding" DROP COLUMN IF EXISTS "seasonId"`);
    await queryRunner.query(`ALTER TABLE "competitionStanding" DROP COLUMN IF EXISTS "teamId"`);

    // 7) Remove standings-like columns from teamCompetitionSeason (source of truth is competitionStanding)
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "points"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "position"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "played"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "wins"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "draws"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "losses"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "goalsFor"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "goalsAgainst"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "goalDifference"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasStanding = await queryRunner.hasTable("competitionStanding");
    const hasTcs = await queryRunner.hasTable("teamCompetitionSeason");
    if (!hasStanding || !hasTcs) return;

    // Re-add columns to standings
    await queryRunner.query(`ALTER TABLE "competitionStanding" ADD COLUMN IF NOT EXISTS "competitionId" integer`);
    await queryRunner.query(`ALTER TABLE "competitionStanding" ADD COLUMN IF NOT EXISTS "seasonId" integer`);
    await queryRunner.query(`ALTER TABLE "competitionStanding" ADD COLUMN IF NOT EXISTS "teamId" integer`);

    // Backfill from join
    await queryRunner.query(`
      UPDATE "competitionStanding" cs
      SET "competitionId" = tcs."competitionId",
          "seasonId" = tcs."seasonId",
          "teamId" = tcs."teamId"
      FROM "teamCompetitionSeason" tcs
      WHERE cs."teamCompetitionSeasonId" = tcs."id"
    `);

    // Drop FK + column
    await queryRunner.query(`
      ALTER TABLE "competitionStanding"
      DROP CONSTRAINT IF EXISTS "FK_competitionStanding_teamCompetitionSeason"
    `);
    await queryRunner.query(`
      ALTER TABLE "competitionStanding"
      ALTER COLUMN "teamCompetitionSeasonId" DROP NOT NULL
    `);
    await queryRunner.query(`ALTER TABLE "competitionStanding" DROP COLUMN IF EXISTS "teamCompetitionSeasonId"`);

    // Re-add old columns to teamCompetitionSeason (best-effort)
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "points" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "position" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "played" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "wins" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "draws" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "losses" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "goalsFor" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "goalsAgainst" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "goalDifference" integer`);

    await queryRunner.query(`
      ALTER TABLE "teamCompetitionSeason"
      DROP CONSTRAINT IF EXISTS "UQ_teamCompetitionSeason_team_comp_season"
    `);
  }
}

