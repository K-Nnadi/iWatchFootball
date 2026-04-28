import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStandingsToTeamCompetitionSeasonAfterCreate1764041000000 implements MigrationInterface {
  name = "AddStandingsToTeamCompetitionSeasonAfterCreate1764041000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("teamCompetitionSeason");
    if (!hasTable) return;

    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "played" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "wins" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "draws" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "losses" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "goalsFor" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "goalsAgainst" integer`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD COLUMN IF NOT EXISTS "goalDifference" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("teamCompetitionSeason");
    if (!hasTable) return;

    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "goalDifference"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "goalsAgainst"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "goalsFor"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "losses"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "draws"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "wins"`);
    await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP COLUMN IF EXISTS "played"`);
  }
}

