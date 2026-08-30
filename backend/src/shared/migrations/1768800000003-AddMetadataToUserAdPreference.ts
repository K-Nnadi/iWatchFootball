import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMetadataToUserAdPreference1768800000003 implements MigrationInterface {
    name = 'AddMetadataToUserAdPreference1768800000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "userAdPreference"
            ADD COLUMN IF NOT EXISTS "metadata" jsonb
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "userAdPreference"
            DROP COLUMN IF EXISTS "metadata"
        `);
    }
}
