import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTicketDemandConfig1768630000000 implements MigrationInterface {
    name = 'SeedTicketDemandConfig1768630000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES (
                'ticket_demand_enabled',
                'boolean',
                false,
                'When true, users can register interest in attending a match to signal demand before resale launches'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'ticket_demand_enabled'`);
    }
}
