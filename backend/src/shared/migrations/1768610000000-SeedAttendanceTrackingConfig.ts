import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAttendanceTrackingConfig1768610000000 implements MigrationInterface {
    name = 'SeedAttendanceTrackingConfig1768610000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES (
                'attendance_tracking_enabled',
                'boolean',
                false,
                'When true, users can mark themselves as going to a match and store ticket details privately'
            )
            ON CONFLICT ("key") DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "booleanValue", "description")
            VALUES (
                'ticket_document_upload_enabled',
                'boolean',
                false,
                'When true, users can upload a private PDF or image of their ticket for personal reference'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" IN ('attendance_tracking_enabled', 'ticket_document_upload_enabled')`);
    }
}
