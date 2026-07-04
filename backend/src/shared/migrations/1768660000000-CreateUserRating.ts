import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRating1768660000000 implements MigrationInterface {
    name = 'CreateUserRating1768660000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "rating_role_enum" AS ENUM ('BUYER', 'SELLER');
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "userRating" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "listingId" integer NOT NULL,
                "raterUserId" integer NOT NULL,
                "targetUserId" integer NOT NULL,
                "raterRole" "rating_role_enum" NOT NULL,
                "score" integer NOT NULL,
                "comment" varchar(300),
                CONSTRAINT "PK_userRating" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_userRating_listing_rater" UNIQUE ("listingId", "raterUserId"),
                CONSTRAINT "CHK_userRating_score" CHECK ("score" >= 1 AND "score" <= 5)
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_userRating_targetUserId"
            ON "userRating" ("targetUserId")
            WHERE "deletedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "userRating"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "rating_role_enum"`);
    }
}
