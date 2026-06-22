import { MigrationInterface, QueryRunner } from 'typeorm';

/** Drops legacy player.teamIds and team.playerIds after playerTeamStint is live. */
export class DropLegacyPlayerTeamIdArrays1768410000000 implements MigrationInterface {
    name = 'DropLegacyPlayerTeamIdArrays1768410000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" DROP COLUMN IF EXISTS "teamIds"`);
        await queryRunner.query(`ALTER TABLE "team" DROP COLUMN IF EXISTS "playerIds"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "player" ADD COLUMN IF NOT EXISTS "teamIds" integer array`);
        await queryRunner.query(`ALTER TABLE "team" ADD COLUMN IF NOT EXISTS "playerIds" integer array`);

        await queryRunner.query(`
            UPDATE "player" p
            SET "teamIds" = ARRAY[p."currentTeamId"]
            WHERE p."currentTeamId" IS NOT NULL
        `);

        await queryRunner.query(`
            UPDATE "team" t
            SET "playerIds" = sub.ids
            FROM (
                SELECT s."teamId", array_agg(DISTINCT s."playerId") AS ids
                FROM "playerTeamStint" s
                WHERE s."isCurrent" = true AND s."deletedAt" IS NULL
                GROUP BY s."teamId"
            ) sub
            WHERE t."id" = sub."teamId"
        `);
    }
}
