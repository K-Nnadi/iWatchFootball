import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlayerFixtureStat1768510000000 implements MigrationInterface {
    name = 'CreatePlayerFixtureStat1768510000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "playerFixtureStat" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "playerId" integer NOT NULL,
                "fixtureId" integer NOT NULL,
                "xg" decimal(8,3),
                "xa" decimal(8,3),
                "shots" integer,
                "shotsOnTarget" integer,
                "headedShots" integer,
                "successfulPasses" integer,
                "passCompletionPct" decimal(5,2),
                "keyPasses" integer,
                "chancesCreated" integer,
                "bigChancesCreated" integer,
                "successfulDribbles" integer,
                "duelsWon" integer,
                "touches" integer,
                "touchesInOppositionBox" integer,
                "foulsWon" integer,
                "defensiveContributions" integer,
                "tackles" integer,
                "interceptions" integer,
                "recoveries" integer,
                "foulsCommitted" integer,
                "minutes" integer,
                "rating" decimal(4,2),
                CONSTRAINT "PK_playerFixtureStat" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_playerFixtureStat_player_fixture" UNIQUE ("playerId", "fixtureId")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_playerFixtureStat_fixtureId"
            ON "playerFixtureStat" ("fixtureId")
            WHERE "deletedAt" IS NULL
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_playerFixtureStat_playerId"
            ON "playerFixtureStat" ("playerId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "playerFixtureStat"
            ADD CONSTRAINT "FK_playerFixtureStat_playerId"
            FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "playerFixtureStat"
            ADD CONSTRAINT "FK_playerFixtureStat_fixtureId"
            FOREIGN KEY ("fixtureId") REFERENCES "fixture"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playerFixtureStat" DROP CONSTRAINT IF EXISTS "FK_playerFixtureStat_fixtureId"`);
        await queryRunner.query(`ALTER TABLE "playerFixtureStat" DROP CONSTRAINT IF EXISTS "FK_playerFixtureStat_playerId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "playerFixtureStat"`);
    }
}
