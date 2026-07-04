import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttendanceRecord1768600000000 implements MigrationInterface {
    name = 'CreateAttendanceRecord1768600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "attendanceRecord" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP WITH TIME ZONE,
                "metadata" jsonb,
                "userId" integer NOT NULL,
                "fixtureId" integer NOT NULL,
                "hasTicket" boolean NOT NULL DEFAULT false,
                "seatSection" varchar(100),
                "seatBlock" varchar(50),
                "seatRow" varchar(20),
                "seatNumber" varchar(20),
                "ticketProvider" varchar(100),
                "purchaseDate" date,
                "notes" varchar(500),
                "documentPath" varchar(1000),
                CONSTRAINT "PK_attendanceRecord" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_attendanceRecord_user_fixture" UNIQUE ("userId", "fixtureId")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_attendanceRecord_userId"
            ON "attendanceRecord" ("userId")
            WHERE "deletedAt" IS NULL
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_attendanceRecord_fixtureId"
            ON "attendanceRecord" ("fixtureId")
            WHERE "deletedAt" IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "attendanceRecord"`);
    }
}
