import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenamePaymentProviderToProcessor1766600000000 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "paymentProvider" RENAME TO "paymentProcessor"`);
        await queryRunner.query(
            `ALTER TYPE "public"."payment_provider_type_enum" RENAME TO "payment_processor_type_enum"`,
        );
        await queryRunner.query(
            `ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "FK_4e4dc4c30ea6063a94344cd5b3f"`,
        );
        await queryRunner.query(
            `ALTER TABLE "payment" RENAME COLUMN "paymentProviderId" TO "paymentProcessorId"`,
        );
        await queryRunner.query(
            `ALTER TABLE "payment" ADD CONSTRAINT "FK_payment_paymentProcessor" FOREIGN KEY ("paymentProcessorId") REFERENCES "paymentProcessor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "payment" DROP CONSTRAINT IF EXISTS "FK_payment_paymentProcessor"`,
        );
        await queryRunner.query(
            `ALTER TABLE "payment" RENAME COLUMN "paymentProcessorId" TO "paymentProviderId"`,
        );
        await queryRunner.query(
            `ALTER TABLE "payment" ADD CONSTRAINT "FK_4e4dc4c30ea6063a94344cd5b3f" FOREIGN KEY ("paymentProviderId") REFERENCES "paymentProvider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TYPE "public"."payment_processor_type_enum" RENAME TO "payment_provider_type_enum"`,
        );
        await queryRunner.query(`ALTER TABLE "paymentProcessor" RENAME TO "paymentProvider"`);
    }
}
