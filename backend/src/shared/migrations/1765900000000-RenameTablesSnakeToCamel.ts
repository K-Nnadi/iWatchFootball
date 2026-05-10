import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTablesSnakeToCamel1765900000000 implements MigrationInterface {
    private readonly renames: [string, string][] = [
        ['marketplace_listing',       'marketplaceListing'],
        ['marketplace_transaction',   'marketplaceTransaction'],
        ['platform_config',           'platformConfig'],
        ['ticket_ownership_history',  'ticketOwnershipHistory'],
        ['user_ticket_log',           'userTicketLog'],
        ['ticket_hold',               'ticketHold'],
    ];

    async up(queryRunner: QueryRunner): Promise<void> {
        for (const [from, to] of this.renames) {
            await queryRunner.query(
                `ALTER TABLE IF EXISTS "${from}" RENAME TO "${to}";`,
            );
        }
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        for (const [from, to] of this.renames) {
            await queryRunner.query(
                `ALTER TABLE IF EXISTS "${to}" RENAME TO "${from}";`,
            );
        }
    }
}
