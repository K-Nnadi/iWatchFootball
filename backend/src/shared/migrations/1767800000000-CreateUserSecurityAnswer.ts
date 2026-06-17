import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSecurityAnswer1767800000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "userSecurityAnswer" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "question" character varying(64) NOT NULL,
                "answerHash" character varying(255) NOT NULL,
                CONSTRAINT "PK_userSecurityAnswer" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_userSecurityAnswer_userId" UNIQUE ("userId")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userSecurityAnswer_userId"
            ON "userSecurityAnswer" ("userId")
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "userSecurityAnswer"`);
    }
}
