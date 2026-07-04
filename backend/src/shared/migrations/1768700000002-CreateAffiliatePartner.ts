import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAffiliatePartner1768700000002 implements MigrationInterface {
    name = 'CreateAffiliatePartner1768700000002';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "affiliatePartner" (
                "id"                   SERIAL NOT NULL,
                "createdAt"            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt"            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt"            TIMESTAMP WITH TIME ZONE,
                "metadata"             jsonb,
                "name"                 character varying(200) NOT NULL,
                "network"              character varying(100),
                "defaultAffiliateTag"  character varying(255),
                "affiliateUrlFormat"   character varying(30),
                "commissionRatePercent" numeric(5,2),
                "isActive"             boolean NOT NULL DEFAULT true,
                "notes"                text,
                CONSTRAINT "PK_affiliatePartner" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "affiliatePartner"`);
    }
}
