import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renames reservation table to match TicketHold entity (`ticket_hold`).
 */
export class RenameTicketOfferHoldToTicketHold1765200000000 implements MigrationInterface {
    name = 'RenameTicketOfferHoldToTicketHold1765200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasOld = await queryRunner.hasTable('ticket_offer_hold');
        const hasNew = await queryRunner.hasTable('ticket_hold');
        if (!hasOld || hasNew) {
            return;
        }
        await queryRunner.renameTable('ticket_offer_hold', 'ticket_hold');
        await queryRunner.query(`
            ALTER TABLE "ticket_hold" RENAME CONSTRAINT "PK_ticket_offer_hold" TO "PK_ticket_hold"
        `);
        await queryRunner.query(`
            ALTER INDEX "UQ_ticket_offer_hold_fixture_offer" RENAME TO "UQ_ticket_hold_fixture_offer"
        `);
        await queryRunner.query(`
            ALTER INDEX "IDX_ticket_offer_hold_expires" RENAME TO "IDX_ticket_hold_expires"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasOld = await queryRunner.hasTable('ticket_offer_hold');
        const hasNew = await queryRunner.hasTable('ticket_hold');
        if (hasOld || !hasNew) {
            return;
        }
        await queryRunner.query(`
            ALTER INDEX "UQ_ticket_hold_fixture_offer" RENAME TO "UQ_ticket_offer_hold_fixture_offer"
        `);
        await queryRunner.query(`
            ALTER INDEX "IDX_ticket_hold_expires" RENAME TO "IDX_ticket_offer_hold_expires"
        `);
        await queryRunner.query(`
            ALTER TABLE "ticket_hold" RENAME CONSTRAINT "PK_ticket_hold" TO "PK_ticket_offer_hold"
        `);
        await queryRunner.renameTable('ticket_hold', 'ticket_offer_hold');
    }
}
