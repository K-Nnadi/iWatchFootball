import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserNotification1767100000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "userNotification" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "type" character varying(64) NOT NULL,
                "title" character varying(200) NOT NULL,
                "message" character varying(500) NOT NULL,
                "readAt" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_userNotification" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userNotification_userId"
            ON "userNotification" ("userId")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userNotification_userId_readAt"
            ON "userNotification" ("userId", "readAt")
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "userNotification"`);
    }
}
