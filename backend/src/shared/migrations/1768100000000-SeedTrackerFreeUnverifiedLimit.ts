import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTrackerFreeUnverifiedLimit1768100000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "numberValue", "description")
            VALUES (
                'tracker_free_unverified_limit',
                'number',
                10,
                'Max manual (non-verified) match logs free-tier users may add'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" = 'tracker_free_unverified_limit'`);
    }
}
