import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketInterest1768620000000 implements MigrationInterface {
    name = 'CreateTicketInterest1768620000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "ticket_interest_status_enum" AS ENUM ('ACTIVE', 'NOTIFIED', 'CANCELLED');
                EXCEPTION WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ticketInterest" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "fixtureId" integer NOT NULL,
                "quantity" integer NOT NULL DEFAULT 1,
                "maxPriceGbp" decimal(10, 2),
                "preferredStand" varchar(100),
                "wantsNotification" boolean NOT NULL DEFAULT true,
                "status" "ticket_interest_status_enum" NOT NULL DEFAULT 'ACTIVE',
                CONSTRAINT "PK_ticketInterest" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketInterest_userId"
            ON "ticketInterest" ("userId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_ticketInterest_fixtureId_status"
            ON "ticketInterest" ("fixtureId", "status")
            WHERE "deletedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "ticketInterest"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "ticket_interest_status_enum"`);
    }
}
