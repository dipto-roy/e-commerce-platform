import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceSupport1736265600000 implements MigrationInterface {
  name = 'AddInvoiceSupport1736265600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add invoice-related columns to orders table
    await queryRunner.query(`
      ALTER TABLE "orders" 
      ADD COLUMN IF NOT EXISTS "invoiceUrl" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "invoiceNumber" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "invoiceGeneratedAt" TIMESTAMP;
    `);

    // Add Stripe-specific columns to payments table
    await queryRunner.query(`
      ALTER TABLE "payments" 
      ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "stripeClientSecret" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "stripeChargeId" VARCHAR(255);
    `);

    // Create index for faster invoice lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_orders_invoiceNumber" 
      ON "orders" ("invoiceNumber");
    `);

    // Create index for Stripe payment intent ID
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payments_stripePaymentIntentId" 
      ON "payments" ("stripePaymentIntentId");
    `);

    // Create invoices directory metadata table (optional)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "invoice_metadata" (
        "id" SERIAL PRIMARY KEY,
        "orderId" INTEGER NOT NULL UNIQUE,
        "invoiceNumber" VARCHAR(50) NOT NULL UNIQUE,
        "generatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "regeneratedAt" TIMESTAMP,
        "fileSize" INTEGER,
        "filePath" VARCHAR(500),
        CONSTRAINT "FK_invoice_metadata_orderId" 
          FOREIGN KEY ("orderId") 
          REFERENCES "orders"("id") 
          ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop invoice metadata table
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_metadata"`);

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payments_stripePaymentIntentId"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_orders_invoiceNumber"`,
    );

    // Remove Stripe columns from payments
    await queryRunner.query(`
      ALTER TABLE "payments" 
      DROP COLUMN IF EXISTS "stripePaymentIntentId",
      DROP COLUMN IF EXISTS "stripeClientSecret",
      DROP COLUMN IF EXISTS "stripeChargeId";
    `);

    // Remove invoice columns from orders
    await queryRunner.query(`
      ALTER TABLE "orders" 
      DROP COLUMN IF EXISTS "invoiceUrl",
      DROP COLUMN IF EXISTS "invoiceNumber",
      DROP COLUMN IF EXISTS "invoiceGeneratedAt";
    `);
  }
}
