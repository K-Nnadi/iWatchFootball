import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFixtureHighlight1768300000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "fixture_highlight_provider_enum" AS ENUM (
                'YouTube', 'Highlightly', 'Sportmonks', 'OfficialWebsite'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "fixture_highlight_type_enum" AS ENUM (
                'Match', 'Extended', 'Goal', 'RedCard', 'Penalty', 'Interview', 'FanReaction'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "fixture_highlight_status_enum" AS ENUM (
                'Pending', 'Active', 'Removed', 'Failed'
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "fixture_highlight" (
                "id"              SERIAL PRIMARY KEY,
                "createdAt"       TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt"       TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt"       TIMESTAMP,
                "metadata"        JSONB,
                "fixtureId"       INTEGER NOT NULL,
                "provider"        "fixture_highlight_provider_enum" NOT NULL,
                "type"            "fixture_highlight_type_enum" NOT NULL,
                "title"           VARCHAR NOT NULL,
                "providerVideoId" VARCHAR NOT NULL,
                "thumbnailUrl"    VARCHAR,
                "embedUrl"        VARCHAR,
                "sourceUrl"       VARCHAR,
                "durationSeconds" INTEGER,
                "publishedAt"     TIMESTAMP,
                "isOfficial"      BOOLEAN NOT NULL DEFAULT false,
                "status"          "fixture_highlight_status_enum" NOT NULL DEFAULT 'Pending',
                "channelName"     VARCHAR,
                CONSTRAINT "FK_fixture_highlight_fixture" FOREIGN KEY ("fixtureId")
                    REFERENCES "fixture" ("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_fixture_highlight_fixtureId_status"
            ON "fixture_highlight" ("fixtureId", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_fixture_highlight_providerVideoId"
            ON "fixture_highlight" ("providerVideoId", "provider")
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "fixture_highlight"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "fixture_highlight_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "fixture_highlight_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "fixture_highlight_provider_enum"`);
    }
}
