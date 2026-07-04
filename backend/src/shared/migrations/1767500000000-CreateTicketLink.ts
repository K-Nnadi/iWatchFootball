import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketLink1767500000000 implements MigrationInterface {
    name = 'CreateTicketLink1767500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ticketLink" (
                "id"            SERIAL NOT NULL,
                "createdAt"     TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt"     TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt"     TIMESTAMP,
                "metadata"      jsonb,
                "fixtureId"     integer,
                "teamId"        integer,
                "competitionId" integer,
                "url"           character varying(2048) NOT NULL,
                "label"         character varying(255) NOT NULL,
                "linkType"      character varying(30) NOT NULL DEFAULT 'OFFICIAL_CLUB',
                "isAffiliate"   boolean NOT NULL DEFAULT false,
                "affiliateTag"  character varying(255),
                "badgeText"     character varying(50),
                "priority"      integer NOT NULL DEFAULT 0,
                "expiresAt"     TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_ticketLink" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketLink_fixture"
            ON "ticketLink" ("fixtureId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketLink_team"
            ON "ticketLink" ("teamId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketLink_competition"
            ON "ticketLink" ("competitionId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketLink_priority"
            ON "ticketLink" ("priority")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ticketLinkClick" (
                "id"           SERIAL NOT NULL,
                "createdAt"    TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt"    TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt"    TIMESTAMP,
                "metadata"     jsonb,
                "ticketLinkId" integer NOT NULL,
                "userId"       integer,
                CONSTRAINT "PK_ticketLinkClick" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketLinkClick_ticketLink"
            ON "ticketLinkClick" ("ticketLinkId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticketLinkClick_ticketLink"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ticketLinkClick"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticketLink_priority"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticketLink_competition"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticketLink_team"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ticketLink_fixture"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "ticketLink"`);
    }
}
