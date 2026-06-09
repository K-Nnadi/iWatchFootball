import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserSubscriptionAndTrackerConfig1766700000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_enum') THEN
                    CREATE TYPE "public"."subscription_status_enum" AS ENUM(
                        'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'none'
                    );
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            DO $$ BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan_slug_enum') THEN
                    CREATE TYPE "public"."subscription_plan_slug_enum" AS ENUM('free', 'premium_monthly');
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "userSubscription" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" integer NOT NULL,
                "stripeCustomerId" character varying(255),
                "stripeSubscriptionId" character varying(255),
                "planSlug" "public"."subscription_plan_slug_enum" NOT NULL DEFAULT 'free',
                "status" "public"."subscription_status_enum" NOT NULL DEFAULT 'none',
                "currentPeriodStart" TIMESTAMP WITH TIME ZONE,
                "currentPeriodEnd" TIMESTAMP WITH TIME ZONE,
                "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false,
                "metadata" jsonb,
                CONSTRAINT "UQ_userSubscription_userId" UNIQUE ("userId"),
                CONSTRAINT "PK_userSubscription" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "numberValue", "description")
            VALUES (
                'tracker_free_verified_limit',
                'number',
                5,
                'Max verified match logs visible to free-tier users'
            )
            ON CONFLICT ("key") DO NOTHING
        `);

        await queryRunner.query(`
            INSERT INTO "platformConfig" ("key", "valueType", "stringValue", "description")
            VALUES (
                'stripe_premium_monthly_price_id',
                'string',
                '',
                'Stripe Price id (price_...) for Premium monthly tracker subscription'
            )
            ON CONFLICT ("key") DO NOTHING
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "platformConfig" WHERE "key" IN (
            'tracker_free_verified_limit',
            'stripe_premium_monthly_price_id'
        )`);
        await queryRunner.query(`DROP TABLE IF EXISTS "userSubscription"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."subscription_plan_slug_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."subscription_status_enum"`);
    }
}
