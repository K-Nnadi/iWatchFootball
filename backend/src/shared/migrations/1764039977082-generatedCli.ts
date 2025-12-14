import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedCli1764039977082 implements MigrationInterface {
    name = 'GeneratedCli1764039977082'

    // Helper function to create table only if it doesn't exist
    private async createTableIfNotExists(queryRunner: QueryRunner, tableName: string, createTableSql: string): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${tableName}') THEN
                    ${createTableSql}
                END IF;
            END $$;
        `);
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create all enum types before creating tables that use them
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'competition_type_enum') THEN
                    CREATE TYPE "public"."competition_type_enum" AS ENUM('League', 'Cup', 'Custom', 'Friendly');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_gender_enum') THEN
                    CREATE TYPE "public"."team_gender_enum" AS ENUM('Male', 'Female', 'Mixed');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_type_enum') THEN
                    CREATE TYPE "public"."team_type_enum" AS ENUM('Club', 'National');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fixtureReferee_role_enum') THEN
                    CREATE TYPE "public"."fixtureReferee_role_enum" AS ENUM('Main', 'Assistant', 'Fourth', 'VAR');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fixture_status_enum') THEN
                    CREATE TYPE "public"."fixture_status_enum" AS ENUM('Scheduled', 'Live', 'HalfTime', 'Finished', 'Postponed', 'Cancelled');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fixture_stage_enum') THEN
                    CREATE TYPE "public"."fixture_stage_enum" AS ENUM('Group', 'Round of 16', 'Quarter Final', 'Semi Final', 'Final', 'Regular Season');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comms_preference_emailnotifications_enum') THEN
                    CREATE TYPE "public"."comms_preference_emailnotifications_enum" AS ENUM('NEVER', 'DAILY', 'WEEKLY', 'IMMEDIATE');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comms_preference_smsnotifications_enum') THEN
                    CREATE TYPE "public"."comms_preference_smsnotifications_enum" AS ENUM('NEVER', 'DAILY', 'WEEKLY', 'IMMEDIATE');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comms_preference_pushnotifications_enum') THEN
                    CREATE TYPE "public"."comms_preference_pushnotifications_enum" AS ENUM('NEVER', 'DAILY', 'WEEKLY', 'IMMEDIATE');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comms_preference_inappnotifications_enum') THEN
                    CREATE TYPE "public"."comms_preference_inappnotifications_enum" AS ENUM('NEVER', 'DAILY', 'WEEKLY', 'IMMEDIATE');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comms_preference_marketingemails_enum') THEN
                    CREATE TYPE "public"."comms_preference_marketingemails_enum" AS ENUM('NEVER', 'DAILY', 'WEEKLY', 'IMMEDIATE');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comms_preference_newsletteremails_enum') THEN
                    CREATE TYPE "public"."comms_preference_newsletteremails_enum" AS ENUM('NEVER', 'DAILY', 'WEEKLY', 'IMMEDIATE');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comms_preference_matchreminders_enum') THEN
                    CREATE TYPE "public"."comms_preference_matchreminders_enum" AS ENUM('NEVER', 'DAILY', 'WEEKLY', 'IMMEDIATE');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'comms_preference_language_enum') THEN
                    CREATE TYPE "public"."comms_preference_language_enum" AS ENUM('EN', 'ES', 'FR', 'DE', 'IT', 'PT');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type_enum') THEN
                    CREATE TYPE "public"."user_type_enum" AS ENUM('USER', 'ADMIN', 'MODERATOR');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'position_type_enum') THEN
                    CREATE TYPE "public"."position_type_enum" AS ENUM('Goalkeeper', 'Defender', 'Midfielder', 'Forward');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'genericToken_type_enum') THEN
                    CREATE TYPE "public"."genericToken_type_enum" AS ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'API_KEY');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'card_type_enum') THEN
                    CREATE TYPE "public"."card_type_enum" AS ENUM('Yellow', 'Red');
                END IF;
            END $$;
        `);
        
        // Create tables with idempotency checks
        await this.createTableIfNotExists(queryRunner, 'address', `CREATE TABLE "address" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "address1" character varying(255), "address2" character varying(255), "townOrCity" character varying(100), "postcode" character varying(20), "country" character varying(100), "location" character varying(255), "stadiumId" integer, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'stadium', `CREATE TABLE "stadium" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "country" character varying NOT NULL, "opened" TIMESTAMP, "teamIds" integer array, "capacity" integer, "addressId" integer, CONSTRAINT "PK_e1fec3f13003877cd87a990655d" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'goal', `CREATE TABLE "goal" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "minute" integer NOT NULL, "scorerId" integer NOT NULL, "assistantId" integer, "fixtureId" integer NOT NULL, "teamId" integer NOT NULL, "ownGoal" boolean NOT NULL, "penalty" boolean, CONSTRAINT "PK_88c8e2b461b711336c836b1e130" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'transfer', `CREATE TABLE "transfer" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "playerId" integer NOT NULL, "sourceTeamId" integer NOT NULL, "destinationTeamId" integer NOT NULL, "transferFee" integer NOT NULL, "date" TIMESTAMP, "isLoan" boolean, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'player', `CREATE TABLE "player" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "nickname" character varying, "dateOfBirth" TIMESTAMP NOT NULL, "nationality" character varying NOT NULL, "positionIds" integer array NOT NULL, "bio" character varying, "teamIds" integer array, "kitNumber" integer, "height" integer, "weight" integer, "photoUrl" character varying, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'trophy', `CREATE TABLE "trophy" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "yearIntroduced" TIMESTAMP, "competitionId" integer, "teamId" integer, "playerId" integer, CONSTRAINT "PK_36c7cac00e373b7c3a7e6da3108" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'competition', `CREATE TABLE "competition" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "code" character varying, "type" "public"."competition_type_enum" NOT NULL DEFAULT 'League', "country" character varying NOT NULL, CONSTRAINT "PK_a52a6248db574777b226e9445bc" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'season', `CREATE TABLE "season" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "yearStart" integer NOT NULL, "yearEnd" integer NOT NULL, CONSTRAINT "PK_8ac0d081dbdb7ab02d166bcda9f" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'teamCompetitionSeason', `CREATE TABLE "teamCompetitionSeason" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "teamId" integer NOT NULL, "competitionId" integer NOT NULL, "seasonId" integer NOT NULL, "points" integer, "position" integer, CONSTRAINT "PK_a9c67e881487e9531903f8a1a77" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'managerEmployment', `CREATE TABLE "managerEmployment" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "managerId" integer NOT NULL, "teamId" integer NOT NULL, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "isCurrent" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_9b72296d76bfa6a18df7f4e3a8b" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'manager', `CREATE TABLE "manager" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "nickname" character varying NOT NULL, "nationality" character varying NOT NULL, "teamIds" integer array, CONSTRAINT "PK_b3ac840005ee4ed76a7f1c51d01" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'team', `CREATE TABLE "team" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "founded" TIMESTAMP, "stadiumIds" integer array, "managerId" integer, "playerIds" integer array, "logoUrl" character varying, "website" character varying, "city" integer, "country" character varying, "gender" "public"."team_gender_enum" DEFAULT 'Male', "type" "public"."team_type_enum" NOT NULL DEFAULT 'Club', "parentId" integer, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'substitution', `CREATE TABLE "substitution" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "fixtureId" integer NOT NULL, "teamId" integer NOT NULL, "playerInId" integer NOT NULL, "playerOutId" integer NOT NULL, "minute" integer, "playerLineupId" integer, CONSTRAINT "PK_35cec3f6b188471602d3dd605fd" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'playerLineup', `CREATE TABLE "playerLineup" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "lineupId" integer NOT NULL, "playerId" integer NOT NULL, "isStarting" boolean NOT NULL, "positionId" integer, "isCaptain" boolean NOT NULL, CONSTRAINT "PK_06296110be2043b5e154e250689" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'lineUp', `CREATE TABLE "lineUp" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "fixtureId" integer NOT NULL, "teamId" integer NOT NULL, "managerId" integer NOT NULL, "formation" character varying, CONSTRAINT "PK_87b245210ef8217b18d6879965f" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'referee', `CREATE TABLE "referee" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "nationality" character varying NOT NULL, CONSTRAINT "PK_e0f1d9028c5872562b234fae470" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'fixtureReferee', `CREATE TABLE "fixtureReferee" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "fixtureId" integer NOT NULL, "refereeId" integer NOT NULL, "role" "public"."fixtureReferee_role_enum" NOT NULL DEFAULT 'Main', CONSTRAINT "PK_bd6d62d26973867ecb73f440feb" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'prediction', `CREATE TABLE "prediction" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, "fixtureId" integer NOT NULL, "predicted" character varying, CONSTRAINT "PK_23df2ceecea9f8bbb996ff056a3" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'fixture', `CREATE TABLE "fixture" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "date" TIMESTAMP NOT NULL, "homeTeamId" integer, "awayTeamId" integer, "competitionId" integer NOT NULL, "seasonId" integer NOT NULL, "stadiumId" integer NOT NULL, "status" "public"."fixture_status_enum" NOT NULL, "stage" "public"."fixture_stage_enum" NOT NULL, "attendance" integer, CONSTRAINT "PK_d9634ba06480dc240af97ad548c" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'log', `CREATE TABLE "log" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, "fixtureId" integer NOT NULL, "ticketNumber" character varying, "isVerified" boolean NOT NULL DEFAULT false, "notes" character varying, CONSTRAINT "PK_350604cbdf991d5930d9e618fbd" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'commsPreference', `CREATE TABLE "commsPreference" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, "emailNotifications" "public"."comms_preference_emailnotifications_enum" NOT NULL DEFAULT 'DAILY', "smsNotifications" "public"."comms_preference_smsnotifications_enum" NOT NULL DEFAULT 'NEVER', "pushNotifications" "public"."comms_preference_pushnotifications_enum" NOT NULL DEFAULT 'IMMEDIATE', "inAppNotifications" "public"."comms_preference_inappnotifications_enum" NOT NULL DEFAULT 'IMMEDIATE', "marketingEmails" "public"."comms_preference_marketingemails_enum" NOT NULL DEFAULT 'WEEKLY', "newsletterEmails" "public"."comms_preference_newsletteremails_enum" NOT NULL DEFAULT 'WEEKLY', "matchReminders" "public"."comms_preference_matchreminders_enum" NOT NULL DEFAULT 'DAILY', "language" "public"."comms_preference_language_enum" NOT NULL DEFAULT 'EN', "timezone" character varying, CONSTRAINT "REL_afcec79a6fe61625c2db8a1d73" UNIQUE ("userId"), CONSTRAINT "PK_9972ebf0f8c1040b476c6c612eb" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'credit', `CREATE TABLE "credit" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "balance" numeric(10,2) NOT NULL DEFAULT '0', "userId" integer NOT NULL, CONSTRAINT "UQ_9f5fdca6886a2ecdb6d34b23d70" UNIQUE ("userId"), CONSTRAINT "PK_c98add8e192ded18b69c3e345a5" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'ticket', `CREATE TABLE "ticket" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "category" character varying(50) NOT NULL, "price" numeric(10,2) NOT NULL, "fixtureId" integer NOT NULL, "userId" integer, "paymentId" integer, CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY ("id"))`);
        // Check if enum type exists before creating it
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_provider_type_enum') THEN
                    CREATE TYPE "public"."payment_provider_type_enum" AS ENUM('CARD', 'WALLET', 'BANK_TRANSFER', 'CRYPTO');
                END IF;
            END $$;
        `);
        await this.createTableIfNotExists(queryRunner, 'paymentProvider', `CREATE TABLE "paymentProvider" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(100) NOT NULL, "slug" character varying(50) NOT NULL, "type" "public"."payment_provider_type_enum" NOT NULL, "apiKey" text NOT NULL, "enabled" boolean NOT NULL DEFAULT false, "logoUrl" character varying(500), "metadata" json, CONSTRAINT "UQ_c3ffc2f1527f6f12d016482a384" UNIQUE ("slug"), CONSTRAINT "PK_ea94f42b6c88e9191c3649d7522" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'payment', `CREATE TABLE "payment" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "method" character varying(20) NOT NULL, "status" character varying NOT NULL, "amount" numeric(10,2), "paymentProviderId" integer, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'transaction', `CREATE TABLE "transaction" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "type" character varying(50) NOT NULL, "amount" numeric(10,2) NOT NULL, "description" character varying(500), "paymentId" integer, "userId" integer NOT NULL, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'user', `CREATE TABLE "user" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "userName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "type" "public"."user_type_enum" NOT NULL DEFAULT 'USER', "commsPreferenceId" integer, "creditId" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_fb1b9802c6974e057df757dcaa" UNIQUE ("creditId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'loyaltyScheme', `CREATE TABLE "loyaltyScheme" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "eventType" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(500), "threshold" numeric(10,2), "rewardAmount" numeric(10,2) NOT NULL, "enabled" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_12177a1538432d5690cb24eba83" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'loyaltyEvent', `CREATE TABLE "loyaltyEvent" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "eventType" character varying(50) NOT NULL, "userId" integer NOT NULL, "loyaltySchemeId" integer, "rewardAmount" numeric(10,2) NOT NULL, "description" character varying(500), CONSTRAINT "PK_f91e996248a0b874eecb844fbed" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'position', `CREATE TABLE "position" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "type" "public"."position_type_enum" NOT NULL, "abbreviation" character varying, CONSTRAINT "PK_b7f483581562b4dc62ae1a5b7e2" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'newsArticle', `CREATE TABLE "newsArticle" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying(500) NOT NULL, "summary" text NOT NULL, "url" character varying(1000) NOT NULL, "imageUrl" character varying(1000), "source" character varying(200) NOT NULL, "publishedAt" TIMESTAMP NOT NULL, "category" character varying(100), "author" character varying(200), CONSTRAINT "UQ_c8124b9d4eefd9efeb340dd1b6a" UNIQUE ("url"), CONSTRAINT "PK_12e2ec4b5482dadc50ee88e0da1" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'injury', `CREATE TABLE "injury" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "playerId" integer NOT NULL, "injuryType" character varying NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP, "status" character varying NOT NULL, CONSTRAINT "PK_66d2dc21ce6d7f55b3d6d45a57a" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'genericToken', `CREATE TABLE "genericToken" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "token" character varying NOT NULL, "type" "public"."genericToken_type_enum" NOT NULL, "expiry" character varying NOT NULL, "userEmail" character varying, "userId" integer NOT NULL, CONSTRAINT "PK_9cda1245cc86afda14979b9e38b" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'competitionStanding', `CREATE TABLE "competitionStanding" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "competitionId" integer NOT NULL, "seasonId" integer NOT NULL, "teamId" integer NOT NULL, "position" integer NOT NULL, "played" integer NOT NULL, "won" integer NOT NULL, "drawn" integer NOT NULL, "lost" integer NOT NULL, "goalsFor" integer NOT NULL, "goalsAgainst" integer NOT NULL, "goalDifference" integer NOT NULL, "points" integer NOT NULL, "form" character varying, "positionChange" integer, CONSTRAINT "PK_5838c0b5c44b4fc0f317b40d9fe" PRIMARY KEY ("id"))`);
        await this.createTableIfNotExists(queryRunner, 'card', `CREATE TABLE "card" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "fixtureId" integer NOT NULL, "playerId" integer NOT NULL, "type" "public"."card_type_enum" NOT NULL, "minute" integer NOT NULL, CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "goal" ADD CONSTRAINT "FK_4bb5747667b59b80b60d2bfe3f0" FOREIGN KEY ("scorerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "goal" ADD CONSTRAINT "FK_8f3b9ec15c84e8fafdd8b6573f2" FOREIGN KEY ("assistantId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "goal" ADD CONSTRAINT "FK_e6c507211b227d4969c286cba24" FOREIGN KEY ("fixtureId") REFERENCES "fixture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_08e149cf789e807bd4c159209df" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_9e2f44554b82ed26467021e778c" FOREIGN KEY ("sourceTeamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transfer" ADD CONSTRAINT "FK_aae2e203df0a6728c8f53b3135a" FOREIGN KEY ("destinationTeamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trophy" ADD CONSTRAINT "FK_f25f081663b2ae8567963e3bd9c" FOREIGN KEY ("competitionId") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trophy" ADD CONSTRAINT "FK_83b2d19a21445e82155454271de" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trophy" ADD CONSTRAINT "FK_af608c5ff42083e2537e107f8a0" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD CONSTRAINT "FK_31ec18167f7bc938bb5aed40710" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD CONSTRAINT "FK_024baab1331d726adf3df1e76b5" FOREIGN KEY ("competitionId") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" ADD CONSTRAINT "FK_720c7254209506368e0f3574c18" FOREIGN KEY ("seasonId") REFERENCES "season"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "managerEmployment" ADD CONSTRAINT "FK_1145a6db739fd126120fbcb4113" FOREIGN KEY ("managerId") REFERENCES "manager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "managerEmployment" ADD CONSTRAINT "FK_8335b217176b4591fdf5f48a45d" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_82b816660e91be06f88e130a99b" FOREIGN KEY ("managerId") REFERENCES "manager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "substitution" ADD CONSTRAINT "FK_be89986538d25536141f6acb2fd" FOREIGN KEY ("playerLineupId") REFERENCES "playerLineup"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "substitution" ADD CONSTRAINT "FK_a660e1abaf603d5b84a6f50be8c" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "substitution" ADD CONSTRAINT "FK_e0ac35ba09b431833686863f748" FOREIGN KEY ("playerInId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "substitution" ADD CONSTRAINT "FK_4444ca86d061c4cc292728f8fb2" FOREIGN KEY ("playerOutId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playerLineup" ADD CONSTRAINT "FK_bd834cfe3652b49a2aaeab5a549" FOREIGN KEY ("lineupId") REFERENCES "lineUp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playerLineup" ADD CONSTRAINT "FK_1bee1b61506db1feb9fbf79654b" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lineUp" ADD CONSTRAINT "FK_acb73905c60973cb34a9eac548f" FOREIGN KEY ("fixtureId") REFERENCES "fixture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lineUp" ADD CONSTRAINT "FK_861c68784085f3e1a3bc8abe0a1" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lineUp" ADD CONSTRAINT "FK_27622adb1e125d02230af152c63" FOREIGN KEY ("managerId") REFERENCES "manager"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fixtureReferee" ADD CONSTRAINT "FK_74a17fb7b147d7d49870e83d48a" FOREIGN KEY ("fixtureId") REFERENCES "fixture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fixtureReferee" ADD CONSTRAINT "FK_57e39a0cce496e3803ab29d78a8" FOREIGN KEY ("refereeId") REFERENCES "referee"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prediction" ADD CONSTRAINT "FK_2c2321258e9932737e9f9415e14" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prediction" ADD CONSTRAINT "FK_cea716aff86be76a7d0bed742dc" FOREIGN KEY ("fixtureId") REFERENCES "fixture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fixture" ADD CONSTRAINT "FK_abbb9dc0c9aca6312eee7d54ad7" FOREIGN KEY ("homeTeamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fixture" ADD CONSTRAINT "FK_6abf61842adc90eb78ccbdbfe01" FOREIGN KEY ("awayTeamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fixture" ADD CONSTRAINT "FK_25bc22fb71d6d3fab52eed0fbed" FOREIGN KEY ("competitionId") REFERENCES "teamCompetitionSeason"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fixture" ADD CONSTRAINT "FK_161ad95605a1ed5a93f13131334" FOREIGN KEY ("stadiumId") REFERENCES "stadium"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "log" ADD CONSTRAINT "FK_cea2ed3a494729d4b21edbd2983" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "log" ADD CONSTRAINT "FK_808f3f2411e2abbe469b73aa15f" FOREIGN KEY ("fixtureId") REFERENCES "fixture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "commsPreference" ADD CONSTRAINT "FK_afcec79a6fe61625c2db8a1d738" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit" ADD CONSTRAINT "FK_9f5fdca6886a2ecdb6d34b23d70" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_65bfc06cc7cf10b8e11fbe2cab2" FOREIGN KEY ("fixtureId") REFERENCES "fixture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_0e01a7c92f008418bad6bad5919" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket" ADD CONSTRAINT "FK_33bcab3730355b8d90c7163716c" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment" ADD CONSTRAINT "FK_4e4dc4c30ea6063a94344cd5b3f" FOREIGN KEY ("paymentProviderId") REFERENCES "paymentProvider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_26ba3b75368b99964d6dea5cc2c" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_fb1b9802c6974e057df757dcaa8" FOREIGN KEY ("creditId") REFERENCES "credit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loyaltyEvent" ADD CONSTRAINT "FK_7240579a488df70d2147c42676e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "loyaltyEvent" ADD CONSTRAINT "FK_bda7d6a9da619059d0f02f263b3" FOREIGN KEY ("loyaltySchemeId") REFERENCES "loyaltyScheme"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competitionStanding" ADD CONSTRAINT "FK_5a233d0e03a2990b74806e3be63" FOREIGN KEY ("competitionId") REFERENCES "competition"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competitionStanding" ADD CONSTRAINT "FK_183a1a962c4bc32b6f5caf2b0c7" FOREIGN KEY ("seasonId") REFERENCES "season"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "competitionStanding" ADD CONSTRAINT "FK_91a83c926903d555c1a7ec0ee3a" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "competitionStanding" DROP CONSTRAINT "FK_91a83c926903d555c1a7ec0ee3a"`);
        await queryRunner.query(`ALTER TABLE "competitionStanding" DROP CONSTRAINT "FK_183a1a962c4bc32b6f5caf2b0c7"`);
        await queryRunner.query(`ALTER TABLE "competitionStanding" DROP CONSTRAINT "FK_5a233d0e03a2990b74806e3be63"`);
        await queryRunner.query(`ALTER TABLE "loyaltyEvent" DROP CONSTRAINT "FK_bda7d6a9da619059d0f02f263b3"`);
        await queryRunner.query(`ALTER TABLE "loyaltyEvent" DROP CONSTRAINT "FK_7240579a488df70d2147c42676e"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb1b9802c6974e057df757dcaa8"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_26ba3b75368b99964d6dea5cc2c"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP CONSTRAINT "FK_4e4dc4c30ea6063a94344cd5b3f"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_33bcab3730355b8d90c7163716c"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_0e01a7c92f008418bad6bad5919"`);
        await queryRunner.query(`ALTER TABLE "ticket" DROP CONSTRAINT "FK_65bfc06cc7cf10b8e11fbe2cab2"`);
        await queryRunner.query(`ALTER TABLE "credit" DROP CONSTRAINT "FK_9f5fdca6886a2ecdb6d34b23d70"`);
        await queryRunner.query(`ALTER TABLE "commsPreference" DROP CONSTRAINT "FK_afcec79a6fe61625c2db8a1d738"`);
        await queryRunner.query(`ALTER TABLE "log" DROP CONSTRAINT "FK_808f3f2411e2abbe469b73aa15f"`);
        await queryRunner.query(`ALTER TABLE "log" DROP CONSTRAINT "FK_cea2ed3a494729d4b21edbd2983"`);
        await queryRunner.query(`ALTER TABLE "fixture" DROP CONSTRAINT "FK_161ad95605a1ed5a93f13131334"`);
        await queryRunner.query(`ALTER TABLE "fixture" DROP CONSTRAINT "FK_25bc22fb71d6d3fab52eed0fbed"`);
        await queryRunner.query(`ALTER TABLE "fixture" DROP CONSTRAINT "FK_6abf61842adc90eb78ccbdbfe01"`);
        await queryRunner.query(`ALTER TABLE "fixture" DROP CONSTRAINT "FK_abbb9dc0c9aca6312eee7d54ad7"`);
        await queryRunner.query(`ALTER TABLE "prediction" DROP CONSTRAINT "FK_cea716aff86be76a7d0bed742dc"`);
        await queryRunner.query(`ALTER TABLE "prediction" DROP CONSTRAINT "FK_2c2321258e9932737e9f9415e14"`);
        await queryRunner.query(`ALTER TABLE "fixtureReferee" DROP CONSTRAINT "FK_57e39a0cce496e3803ab29d78a8"`);
        await queryRunner.query(`ALTER TABLE "fixtureReferee" DROP CONSTRAINT "FK_74a17fb7b147d7d49870e83d48a"`);
        await queryRunner.query(`ALTER TABLE "lineUp" DROP CONSTRAINT "FK_27622adb1e125d02230af152c63"`);
        await queryRunner.query(`ALTER TABLE "lineUp" DROP CONSTRAINT "FK_861c68784085f3e1a3bc8abe0a1"`);
        await queryRunner.query(`ALTER TABLE "lineUp" DROP CONSTRAINT "FK_acb73905c60973cb34a9eac548f"`);
        await queryRunner.query(`ALTER TABLE "playerLineup" DROP CONSTRAINT "FK_1bee1b61506db1feb9fbf79654b"`);
        await queryRunner.query(`ALTER TABLE "playerLineup" DROP CONSTRAINT "FK_bd834cfe3652b49a2aaeab5a549"`);
        await queryRunner.query(`ALTER TABLE "substitution" DROP CONSTRAINT "FK_4444ca86d061c4cc292728f8fb2"`);
        await queryRunner.query(`ALTER TABLE "substitution" DROP CONSTRAINT "FK_e0ac35ba09b431833686863f748"`);
        await queryRunner.query(`ALTER TABLE "substitution" DROP CONSTRAINT "FK_a660e1abaf603d5b84a6f50be8c"`);
        await queryRunner.query(`ALTER TABLE "substitution" DROP CONSTRAINT "FK_be89986538d25536141f6acb2fd"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_82b816660e91be06f88e130a99b"`);
        await queryRunner.query(`ALTER TABLE "managerEmployment" DROP CONSTRAINT "FK_8335b217176b4591fdf5f48a45d"`);
        await queryRunner.query(`ALTER TABLE "managerEmployment" DROP CONSTRAINT "FK_1145a6db739fd126120fbcb4113"`);
        await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP CONSTRAINT "FK_720c7254209506368e0f3574c18"`);
        await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP CONSTRAINT "FK_024baab1331d726adf3df1e76b5"`);
        await queryRunner.query(`ALTER TABLE "teamCompetitionSeason" DROP CONSTRAINT "FK_31ec18167f7bc938bb5aed40710"`);
        await queryRunner.query(`ALTER TABLE "trophy" DROP CONSTRAINT "FK_af608c5ff42083e2537e107f8a0"`);
        await queryRunner.query(`ALTER TABLE "trophy" DROP CONSTRAINT "FK_83b2d19a21445e82155454271de"`);
        await queryRunner.query(`ALTER TABLE "trophy" DROP CONSTRAINT "FK_f25f081663b2ae8567963e3bd9c"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_aae2e203df0a6728c8f53b3135a"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_9e2f44554b82ed26467021e778c"`);
        await queryRunner.query(`ALTER TABLE "transfer" DROP CONSTRAINT "FK_08e149cf789e807bd4c159209df"`);
        await queryRunner.query(`ALTER TABLE "goal" DROP CONSTRAINT "FK_e6c507211b227d4969c286cba24"`);
        await queryRunner.query(`ALTER TABLE "goal" DROP CONSTRAINT "FK_8f3b9ec15c84e8fafdd8b6573f2"`);
        await queryRunner.query(`ALTER TABLE "goal" DROP CONSTRAINT "FK_4bb5747667b59b80b60d2bfe3f0"`);
        await queryRunner.query(`DROP TABLE "card"`);
        await queryRunner.query(`DROP TABLE "competitionStanding"`);
        await queryRunner.query(`DROP TABLE "genericToken"`);
        await queryRunner.query(`DROP TABLE "injury"`);
        await queryRunner.query(`DROP TABLE "newsArticle"`);
        await queryRunner.query(`DROP TABLE "position"`);
        await queryRunner.query(`DROP TABLE "loyaltyEvent"`);
        await queryRunner.query(`DROP TABLE "loyaltyScheme"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TABLE "paymentProvider"`);
        await queryRunner.query(`DROP TYPE "public"."payment_provider_type_enum"`);
        await queryRunner.query(`DROP TABLE "ticket"`);
        await queryRunner.query(`DROP TABLE "credit"`);
        await queryRunner.query(`DROP TABLE "commsPreference"`);
        await queryRunner.query(`DROP TABLE "log"`);
        await queryRunner.query(`DROP TABLE "fixture"`);
        await queryRunner.query(`DROP TABLE "prediction"`);
        await queryRunner.query(`DROP TABLE "fixtureReferee"`);
        await queryRunner.query(`DROP TABLE "referee"`);
        await queryRunner.query(`DROP TABLE "lineUp"`);
        await queryRunner.query(`DROP TABLE "playerLineup"`);
        await queryRunner.query(`DROP TABLE "substitution"`);
        await queryRunner.query(`DROP TABLE "team"`);
        await queryRunner.query(`DROP TABLE "manager"`);
        await queryRunner.query(`DROP TABLE "managerEmployment"`);
        await queryRunner.query(`DROP TABLE "teamCompetitionSeason"`);
        await queryRunner.query(`DROP TABLE "season"`);
        await queryRunner.query(`DROP TABLE "competition"`);
        await queryRunner.query(`DROP TABLE "trophy"`);
        await queryRunner.query(`DROP TABLE "player"`);
        await queryRunner.query(`DROP TABLE "transfer"`);
        await queryRunner.query(`DROP TABLE "goal"`);
        await queryRunner.query(`DROP TABLE "stadium"`);
        await queryRunner.query(`DROP TABLE "address"`);
        
        // Drop all enum types
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."card_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."genericToken_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."position_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."comms_preference_language_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."comms_preference_matchreminders_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."comms_preference_newsletteremails_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."comms_preference_marketingemails_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."comms_preference_inappnotifications_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."comms_preference_pushnotifications_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."comms_preference_smsnotifications_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."comms_preference_emailnotifications_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."fixture_stage_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."fixture_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."fixtureReferee_role_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."team_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."team_gender_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."competition_type_enum"`);
    }

}
