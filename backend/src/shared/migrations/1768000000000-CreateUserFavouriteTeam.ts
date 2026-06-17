import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserFavouriteTeam1768000000000 implements MigrationInterface {
    name = 'CreateUserFavouriteTeam1768000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "userFavouriteTeam" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "teamId" integer NOT NULL,
                CONSTRAINT "PK_userFavouriteTeam" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_userFavouriteTeam_userId_teamId" UNIQUE ("userId", "teamId")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userFavouriteTeam_userId"
            ON "userFavouriteTeam" ("userId")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userFavouriteTeam_teamId"
            ON "userFavouriteTeam" ("teamId")
        `);

        await queryRunner.query(`
            ALTER TABLE "userFavouriteTeam"
            ADD CONSTRAINT "FK_userFavouriteTeam_userId"
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE "userFavouriteTeam"
            ADD CONSTRAINT "FK_userFavouriteTeam_teamId"
            FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            INSERT INTO "userFavouriteTeam" ("userId", "teamId")
            SELECT "id", "favouriteTeamId"
            FROM "user"
            WHERE "favouriteTeamId" IS NOT NULL
            ON CONFLICT ("userId", "teamId") DO NOTHING
        `);

        await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "FK_user_favouriteTeamId"
        `);
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN IF EXISTS "favouriteTeamId"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "favouriteTeamId" integer
        `);
        await queryRunner.query(`
            UPDATE "user" u
            SET "favouriteTeamId" = sub."teamId"
            FROM (
                SELECT DISTINCT ON ("userId") "userId", "teamId"
                FROM "userFavouriteTeam"
                ORDER BY "userId", "id" ASC
            ) sub
            WHERE u."id" = sub."userId"
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD CONSTRAINT "FK_user_favouriteTeamId"
            FOREIGN KEY ("favouriteTeamId") REFERENCES "team"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`ALTER TABLE "userFavouriteTeam" DROP CONSTRAINT IF EXISTS "FK_userFavouriteTeam_teamId"`);
        await queryRunner.query(`ALTER TABLE "userFavouriteTeam" DROP CONSTRAINT IF EXISTS "FK_userFavouriteTeam_userId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "userFavouriteTeam"`);
    }
}
