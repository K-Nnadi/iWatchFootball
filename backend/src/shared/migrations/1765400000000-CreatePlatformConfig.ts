import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlatformConfig1765400000000 implements MigrationInterface {
    name = 'CreatePlatformConfig1765400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "platform_config" (
                "id"          SERIAL NOT NULL,
                "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt"   TIMESTAMP,
                "metadata"    jsonb,
                "key"         character varying(100) NOT NULL,
                "value"       character varying(500) NOT NULL,
                "description" character varying(500),
                CONSTRAINT "PK_platform_config" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_platform_config_key" UNIQUE ("key")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "platform_config" ("key", "value", "description")
            VALUES (
                'marketplace_fee_rate',
                '0.10',
                'Admin fee rate added on top of the seller ask price for marketplace resale transactions (e.g. 0.10 = 10%)'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "platform_config"`);
    }
}
