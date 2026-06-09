import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserConnectionAndTrackerPrivacy1767000000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "trackerVisibility" character varying(32) NOT NULL DEFAULT 'PRIVATE'
        `);
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS "shareVerifiedOnly" boolean NOT NULL DEFAULT true
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "userConnection" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "requesterId" integer NOT NULL,
                "addresseeId" integer NOT NULL,
                "status" character varying(32) NOT NULL DEFAULT 'PENDING',
                CONSTRAINT "PK_userConnection" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_userConnection_pair" UNIQUE ("requesterId", "addresseeId"),
                CONSTRAINT "CHK_userConnection_not_self" CHECK ("requesterId" <> "addresseeId")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userConnection_requester"
            ON "userConnection" ("requesterId")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userConnection_addressee"
            ON "userConnection" ("addresseeId")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userConnection_status"
            ON "userConnection" ("status")
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "userConnection"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "shareVerifiedOnly"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "trackerVisibility"`);
    }
}
