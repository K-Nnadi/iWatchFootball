import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSyncJob1766200000000 implements MigrationInterface {
  name = 'CreateSyncJob1766200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "syncJob" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "status" character varying(32) NOT NULL,
                "preset" jsonb,
                "apiRequestsUsed" integer NOT NULL DEFAULT 0,
                "lastError" text,
                "bullJobId" character varying(64),
                "startedAt" TIMESTAMP,
                "finishedAt" TIMESTAMP,
                CONSTRAINT "PK_sync_job" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "syncJobStep" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "metadata" jsonb,
                "jobId" integer NOT NULL,
                "stepKey" character varying(64) NOT NULL,
                "status" character varying(32) NOT NULL,
                "cursor" jsonb,
                "stepError" text,
                "resultSummary" jsonb,
                CONSTRAINT "PK_sync_job_step" PRIMARY KEY ("id"),
                CONSTRAINT "FK_sync_job_step_job" FOREIGN KEY ("jobId") REFERENCES "syncJob"("id") ON DELETE CASCADE
            )
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_sync_job_step_jobId"
            ON "syncJobStep" ("jobId")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "syncJobStep"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "syncJob"`);
  }
}
