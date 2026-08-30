import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1768800000000 implements MigrationInterface {
    name = 'AddUserProfileFields1768800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "dateOfBirth" date`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "country" varchar(2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "country"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "dateOfBirth"`);
    }
}
