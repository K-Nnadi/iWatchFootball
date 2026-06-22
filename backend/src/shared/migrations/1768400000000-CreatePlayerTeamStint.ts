import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlayerTeamStint1768400000000 implements MigrationInterface {
    name = 'CreatePlayerTeamStint1768400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "player_team_stint_source_enum" AS ENUM ('transfer', 'import', 'lineup', 'manual');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "playerTeamStint" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "playerId" integer NOT NULL,
                "teamId" integer NOT NULL,
                "startDate" TIMESTAMP,
                "endDate" TIMESTAMP,
                "isCurrent" boolean NOT NULL DEFAULT false,
                "isLoan" boolean NOT NULL DEFAULT false,
                "kitNumber" integer,
                "seasonId" integer,
                "source" "player_team_stint_source_enum" NOT NULL DEFAULT 'manual',
                CONSTRAINT "PK_playerTeamStint" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_playerTeamStint_player_team_start" UNIQUE ("playerId", "teamId", "startDate")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_playerTeamStint_teamId_isCurrent"
            ON "playerTeamStint" ("teamId", "isCurrent")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_playerTeamStint_playerId_isCurrent"
            ON "playerTeamStint" ("playerId", "isCurrent")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_playerTeamStint_seasonId"
            ON "playerTeamStint" ("seasonId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "playerTeamStint"
            ADD CONSTRAINT "FK_playerTeamStint_playerId"
            FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "playerTeamStint"
            ADD CONSTRAINT "FK_playerTeamStint_teamId"
            FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "playerTeamStint"
            ADD CONSTRAINT "FK_playerTeamStint_seasonId"
            FOREIGN KEY ("seasonId") REFERENCES "season"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "player" ADD COLUMN IF NOT EXISTS "currentTeamId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "player"
            ADD CONSTRAINT "FK_player_currentTeamId"
            FOREIGN KEY ("currentTeamId") REFERENCES "team"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            INSERT INTO "playerTeamStint" (
                "playerId", "teamId", "startDate", "endDate", "isCurrent", "isLoan", "source"
            )
            SELECT DISTINCT ON (t."playerId")
                t."playerId",
                t."destinationTeamId",
                COALESCE(t."date", t."createdAt"),
                NULL,
                true,
                COALESCE(t."isLoan", false),
                'transfer'::"player_team_stint_source_enum"
            FROM "transfer" t
            ORDER BY t."playerId", COALESCE(t."date", t."createdAt") DESC, t."id" DESC
            ON CONFLICT ("playerId", "teamId", "startDate") DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO "playerTeamStint" (
                "playerId", "teamId", "startDate", "endDate", "isCurrent", "isLoan", "source"
            )
            SELECT
                p."id",
                tid,
                COALESCE(p."updatedAt", p."createdAt"),
                NULL,
                true,
                false,
                'import'::"player_team_stint_source_enum"
            FROM "player" p
            CROSS JOIN LATERAL (
                SELECT (p."teamIds"[array_length(p."teamIds", 1)])::int AS tid
            ) x
            WHERE p."teamIds" IS NOT NULL
              AND array_length(p."teamIds", 1) > 0
              AND tid IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM "playerTeamStint" s
                  WHERE s."playerId" = p."id" AND s."isCurrent" = true AND s."deletedAt" IS NULL
              )
            ON CONFLICT ("playerId", "teamId", "startDate") DO NOTHING
        `);

        await queryRunner.query(`
            UPDATE "player" p
            SET "currentTeamId" = s."teamId"
            FROM "playerTeamStint" s
            WHERE s."playerId" = p."id"
              AND s."isCurrent" = true
              AND s."isLoan" = false
              AND s."deletedAt" IS NULL
              AND s."id" = (
                  SELECT s2."id" FROM "playerTeamStint" s2
                  WHERE s2."playerId" = p."id"
                    AND s2."isCurrent" = true
                    AND s2."isLoan" = false
                    AND s2."deletedAt" IS NULL
                  ORDER BY s2."startDate" DESC NULLS LAST, s2."id" DESC
                  LIMIT 1
              )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT IF EXISTS "FK_player_currentTeamId"`);
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN IF EXISTS "currentTeamId"`);
        await queryRunner.query(`ALTER TABLE "playerTeamStint" DROP CONSTRAINT IF EXISTS "FK_playerTeamStint_seasonId"`);
        await queryRunner.query(`ALTER TABLE "playerTeamStint" DROP CONSTRAINT IF EXISTS "FK_playerTeamStint_teamId"`);
        await queryRunner.query(`ALTER TABLE "playerTeamStint" DROP CONSTRAINT IF EXISTS "FK_playerTeamStint_playerId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "playerTeamStint"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "player_team_stint_source_enum"`);
    }
}
