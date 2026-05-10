import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTicketLog1765800000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS user_ticket_log (
                id             SERIAL PRIMARY KEY,
                "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
                "deletedAt"    TIMESTAMPTZ,
                metadata       JSONB,
                "userId"       INT NOT NULL,
                "ticketId"     INT NOT NULL,
                "active"       BOOLEAN NOT NULL DEFAULT true,
                CONSTRAINT uq_user_ticket_log UNIQUE ("userId", "ticketId")
            );
        `);

        await queryRunner.query(`
            CREATE INDEX idx_user_ticket_log_user_active
            ON user_ticket_log ("userId", "active");
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS user_ticket_log;`);
    }
}
