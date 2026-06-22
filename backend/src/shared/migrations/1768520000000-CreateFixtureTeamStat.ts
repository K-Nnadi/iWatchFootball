import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFixtureTeamStat1768520000000 implements MigrationInterface {
    name = 'CreateFixtureTeamStat1768520000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "fixture_team_stat_source_enum" AS ENUM ('api_sports', 'derived', 'manual');
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "fixture_team_stat_side_enum" AS ENUM ('home', 'away');
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "fixtureTeamStat" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "fixtureId" integer NOT NULL,
                "teamId" integer NOT NULL,
                "side" "fixture_team_stat_side_enum" NOT NULL,
                "source" "fixture_team_stat_source_enum" NOT NULL DEFAULT 'api_sports',
                "possession" decimal(5,2),
                "shotsTotal" integer,
                "shotsOnTarget" integer,
                "shotsOffTarget" integer,
                "shotsBlocked" integer,
                "shotsInsideBox" integer,
                "shotsOutsideBox" integer,
                "xg" decimal(5,2),
                "corners" integer,
                "fouls" integer,
                "offsides" integer,
                "yellowCards" integer,
                "redCards" integer,
                "goalkeeperSaves" integer,
                "passesTotal" integer,
                "passesAccurate" integer,
                "passAccuracyPct" decimal(5,2),
                CONSTRAINT "PK_fixtureTeamStat" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_fixtureTeamStat_fixture_team" UNIQUE ("fixtureId", "teamId")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_fixtureTeamStat_fixtureId"
            ON "fixtureTeamStat" ("fixtureId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_fixtureTeamStat_teamId"
            ON "fixtureTeamStat" ("teamId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "fixtureTeamStat"
            ADD CONSTRAINT "FK_fixtureTeamStat_fixtureId"
            FOREIGN KEY ("fixtureId") REFERENCES "fixture"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "fixtureTeamStat"
            ADD CONSTRAINT "FK_fixtureTeamStat_teamId"
            FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fixtureTeamStat" DROP CONSTRAINT IF EXISTS "FK_fixtureTeamStat_teamId"`);
        await queryRunner.query(`ALTER TABLE "fixtureTeamStat" DROP CONSTRAINT IF EXISTS "FK_fixtureTeamStat_fixtureId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "fixtureTeamStat"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "fixture_team_stat_source_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "fixture_team_stat_side_enum"`);
    }
}
