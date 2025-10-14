import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedCli1760406578229 implements MigrationInterface {
    name = 'GeneratedCli1760406578229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."comms_preference_emailnotifications_enum" AS ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'NEVER')`);
        await queryRunner.query(`CREATE TYPE "public"."comms_preference_smsnotifications_enum" AS ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'NEVER')`);
        await queryRunner.query(`CREATE TYPE "public"."comms_preference_pushnotifications_enum" AS ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'NEVER')`);
        await queryRunner.query(`CREATE TYPE "public"."comms_preference_inappnotifications_enum" AS ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'NEVER')`);
        await queryRunner.query(`CREATE TYPE "public"."comms_preference_marketingemails_enum" AS ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'NEVER')`);
        await queryRunner.query(`CREATE TYPE "public"."comms_preference_newsletteremails_enum" AS ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'NEVER')`);
        await queryRunner.query(`CREATE TYPE "public"."comms_preference_matchreminders_enum" AS ENUM('IMMEDIATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'NEVER')`);
        await queryRunner.query(`CREATE TYPE "public"."comms_preference_language_enum" AS ENUM('EN', 'ES', 'FR', 'DE', 'IT', 'PT')`);
        await queryRunner.query(`CREATE TABLE "comms_preference" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, "emailNotifications" "public"."comms_preference_emailnotifications_enum" NOT NULL DEFAULT 'DAILY', "smsNotifications" "public"."comms_preference_smsnotifications_enum" NOT NULL DEFAULT 'NEVER', "pushNotifications" "public"."comms_preference_pushnotifications_enum" NOT NULL DEFAULT 'IMMEDIATE', "inAppNotifications" "public"."comms_preference_inappnotifications_enum" NOT NULL DEFAULT 'IMMEDIATE', "marketingEmails" "public"."comms_preference_marketingemails_enum" NOT NULL DEFAULT 'WEEKLY', "newsletterEmails" "public"."comms_preference_newsletteremails_enum" NOT NULL DEFAULT 'WEEKLY', "matchReminders" "public"."comms_preference_matchreminders_enum" NOT NULL DEFAULT 'DAILY', "language" "public"."comms_preference_language_enum" NOT NULL DEFAULT 'EN', "timezone" character varying, CONSTRAINT "REL_afcec79a6fe61625c2db8a1d73" UNIQUE ("userId"), CONSTRAINT "PK_9972ebf0f8c1040b476c6c612eb" PRIMARY KEY ("id"))`);
        // Note: Metadata columns are intentionally preserved as they are part of BaseDbEntity
        await queryRunner.query(`ALTER TYPE "public"."user_type_enum" RENAME TO "user_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_type_enum" AS ENUM('ADMIN', 'MODERATOR', 'USER')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" TYPE "public"."user_type_enum" USING "type"::"text"::"public"."user_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" SET DEFAULT 'USER'`);
        await queryRunner.query(`DROP TYPE "public"."user_type_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."team_gender_enum" RENAME TO "team_gender_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."team_gender_enum" AS ENUM('Male', 'Female')`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "gender" TYPE "public"."team_gender_enum" USING "gender"::"text"::"public"."team_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "gender" SET DEFAULT 'Male'`);
        await queryRunner.query(`DROP TYPE "public"."team_gender_enum_old"`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "gender" SET DEFAULT 'Male'`);
        await queryRunner.query(`ALTER TABLE "genericToken" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."genericToken_type_enum" AS ENUM('FORGOT_PASSWORD')`);
        await queryRunner.query(`ALTER TABLE "genericToken" ADD "type" "public"."genericToken_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comms_preference" ADD CONSTRAINT "FK_afcec79a6fe61625c2db8a1d738" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comms_preference" DROP CONSTRAINT "FK_afcec79a6fe61625c2db8a1d738"`);
        await queryRunner.query(`ALTER TABLE "genericToken" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."genericToken_type_enum"`);
        await queryRunner.query(`ALTER TABLE "genericToken" ADD "type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "gender" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."team_gender_enum_old" AS ENUM('MALE', 'FEMALE')`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "gender" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "gender" TYPE "public"."team_gender_enum_old" USING "gender"::"text"::"public"."team_gender_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."team_gender_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."team_gender_enum_old" RENAME TO "team_gender_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."user_type_enum_old" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" TYPE "public"."user_type_enum_old" USING "type"::"text"::"public"."user_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" SET DEFAULT 'USER'`);
        await queryRunner.query(`DROP TYPE "public"."user_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_type_enum_old" RENAME TO "user_type_enum"`);
        // Note: Metadata columns are intentionally preserved as they are part of BaseDbEntity
        await queryRunner.query(`DROP TABLE "comms_preference"`);
        await queryRunner.query(`DROP TYPE "public"."comms_preference_language_enum"`);
        await queryRunner.query(`DROP TYPE "public"."comms_preference_matchreminders_enum"`);
        await queryRunner.query(`DROP TYPE "public"."comms_preference_newsletteremails_enum"`);
        await queryRunner.query(`DROP TYPE "public"."comms_preference_marketingemails_enum"`);
        await queryRunner.query(`DROP TYPE "public"."comms_preference_inappnotifications_enum"`);
        await queryRunner.query(`DROP TYPE "public"."comms_preference_pushnotifications_enum"`);
        await queryRunner.query(`DROP TYPE "public"."comms_preference_smsnotifications_enum"`);
        await queryRunner.query(`DROP TYPE "public"."comms_preference_emailnotifications_enum"`);
    }

}
