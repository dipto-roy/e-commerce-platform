import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentFieldsClean1762391000000 implements MigrationInterface {
    name = 'AddPaymentFieldsClean1762391000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add paymentMethod to orders table
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD COLUMN IF NOT EXISTS "paymentMethod" VARCHAR(20) DEFAULT 'cod'
        `);

        // Add paymentStatus to orders table
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orders_paymentstatus_enum') THEN
                    CREATE TYPE "orders_paymentstatus_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD COLUMN IF NOT EXISTS "paymentStatus" "orders_paymentstatus_enum" DEFAULT 'PENDING'
        `);

        // Add paidAt to payments table
        await queryRunner.query(`
            ALTER TABLE "payments" 
            ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP
        `);

        // Update existing orders to have explicit payment method and status
        await queryRunner.query(`
            UPDATE "orders" 
            SET "paymentMethod" = 'cod', "paymentStatus" = 'PENDING' 
            WHERE "paymentMethod" IS NULL OR "paymentStatus" IS NULL
        `);

        // Create indexes for better query performance
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_orders_paymentStatus" 
            ON "orders" ("paymentStatus")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_orders_paymentMethod" 
            ON "orders" ("paymentMethod")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_paymentMethod"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_paymentStatus"`);

        // Drop columns
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN IF EXISTS "paidAt"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "paymentStatus"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "paymentMethod"`);

        // Drop enum type
        await queryRunner.query(`DROP TYPE IF EXISTS "orders_paymentstatus_enum"`);
    }
}
