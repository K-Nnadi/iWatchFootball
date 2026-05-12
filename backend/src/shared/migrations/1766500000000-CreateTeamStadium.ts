import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamStadium1766500000000 implements MigrationInterface {
  name = 'CreateTeamStadium1766500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTeamStadium = await queryRunner.hasTable('teamStadium');
    if (!hasTeamStadium) {
      await queryRunner.query(`
        CREATE TABLE "teamStadium" (
          "id" SERIAL NOT NULL,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP,
          "metadata" jsonb,
          "teamId" integer NOT NULL,
          "stadiumId" integer NOT NULL,
          CONSTRAINT "PK_teamStadium" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_teamStadium_teamId_stadiumId" UNIQUE ("teamId", "stadiumId"),
          CONSTRAINT "FK_teamStadium_team" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE,
          CONSTRAINT "FK_teamStadium_stadium" FOREIGN KEY ("stadiumId") REFERENCES "stadium"("id") ON DELETE CASCADE
        )
      `);
    }

    const teamCols: { column_name: string }[] = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'team' AND column_name = 'stadiumIds'`,
    );
    if (teamCols.length > 0) {
      await queryRunner.query(`
        INSERT INTO "teamStadium" ("createdAt", "updatedAt", "teamId", "stadiumId")
        SELECT DISTINCT NOW(), NOW(), x."teamId", x."stadiumId"
        FROM (
          SELECT t.id AS "teamId", unnest(t."stadiumIds") AS "stadiumId"
          FROM "team" t
          WHERE t."stadiumIds" IS NOT NULL AND cardinality(t."stadiumIds") > 0
          UNION
          SELECT unnest(s."teamIds") AS "teamId", s.id AS "stadiumId"
          FROM "stadium" s
          WHERE s."teamIds" IS NOT NULL AND cardinality(s."teamIds") > 0
        ) x
        WHERE x."teamId" IS NOT NULL AND x."stadiumId" IS NOT NULL
        ON CONFLICT ("teamId", "stadiumId") DO NOTHING
      `);
    }

    await queryRunner.query(`ALTER TABLE "team" DROP COLUMN IF EXISTS "stadiumIds"`);
    await queryRunner.query(`ALTER TABLE "stadium" DROP COLUMN IF EXISTS "teamIds"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team" ADD COLUMN IF NOT EXISTS "stadiumIds" integer array`);
    await queryRunner.query(`ALTER TABLE "stadium" ADD COLUMN IF NOT EXISTS "teamIds" integer array`);

    const hasTeamStadium = await queryRunner.hasTable('teamStadium');
    if (hasTeamStadium) {
      await queryRunner.query(`
        UPDATE "team" t SET "stadiumIds" = agg.ids
        FROM (
          SELECT "teamId", array_agg("stadiumId" ORDER BY "stadiumId") AS ids
          FROM "teamStadium"
          GROUP BY "teamId"
        ) agg
        WHERE t.id = agg."teamId"
      `);

      await queryRunner.query(`
        UPDATE "stadium" s SET "teamIds" = agg.ids
        FROM (
          SELECT "stadiumId", array_agg("teamId" ORDER BY "teamId") AS ids
          FROM "teamStadium"
          GROUP BY "stadiumId"
        ) agg
        WHERE s.id = agg."stadiumId"
      `);

      await queryRunner.query(`DROP TABLE IF EXISTS "teamStadium"`);
    }
  }
}
