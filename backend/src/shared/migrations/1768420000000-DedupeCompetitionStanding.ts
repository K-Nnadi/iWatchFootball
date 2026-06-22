import { MigrationInterface, QueryRunner } from 'typeorm';

export class DedupeCompetitionStanding1768420000000 implements MigrationInterface {
    name = 'DedupeCompetitionStanding1768420000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "competitionStanding" cs
            WHERE cs."deletedAt" IS NULL
              AND cs.id NOT IN (
                SELECT DISTINCT ON ("teamCompetitionSeasonId") id
                FROM "competitionStanding"
                WHERE "deletedAt" IS NULL
                ORDER BY
                  "teamCompetitionSeasonId",
                  (CASE WHEN form IS NOT NULL AND trim(form) <> '' THEN 1 ELSE 0 END) DESC,
                  id DESC
              )
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "UQ_competitionStanding_teamCompetitionSeasonId_active"
            ON "competitionStanding" ("teamCompetitionSeasonId")
            WHERE "deletedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS "UQ_competitionStanding_teamCompetitionSeasonId_active"
        `);
    }
}
