import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketOwnershipHistory1765500000000 implements MigrationInterface {
    name = 'CreateTicketOwnershipHistory1765500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "ticket_ownership_history" (
                "id"                       SERIAL NOT NULL,
                "createdAt"                TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt"                TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt"                TIMESTAMP,
                "metadata"                 jsonb,
                "ticketId"                 integer NOT NULL,
                "fromUserId"               integer,
                "toUserId"                 integer,
                "reason"                   character varying(30) NOT NULL,
                "paymentId"                integer,
                "listingId"                integer,
                "marketplaceTransactionId" integer,
                CONSTRAINT "PK_ticket_ownership_history" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_toh_ticket"
            ON "ticket_ownership_history" ("ticketId")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_toh_to_user"
            ON "ticket_ownership_history" ("toUserId")
            WHERE "toUserId" IS NOT NULL
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_toh_from_user"
            ON "ticket_ownership_history" ("fromUserId")
            WHERE "fromUserId" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "ticket_ownership_history"`);
    }
}
