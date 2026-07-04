import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMarketplaceFees1768650000000 implements MigrationInterface {
    name = 'SeedMarketplaceFees1768650000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "numberValue", "description")
            VALUES (
                'marketplace_seller_fee_rate',
                'number',
                0.05,
                'Seller-side marketplace fee as a decimal (e.g. 0.05 = 5%). Deducted from payout at transfer confirmation.'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'marketplace_seller_fee_rate'`);
    }
}
