import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderIdempotencyKey1700000000005 implements MigrationInterface {
  name = 'AddOrderIdempotencyKey1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add idempotency_key column (nullable varchar)
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "idempotency_key" character varying(128)
    `);

    // Composite unique index on (userId, idempotency_key) — PostgreSQL
    // allows multiple NULLs in unique indexes, so nullable rows never collide.
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ORDER_USER_IDEMPOTENCY"
      ON "orders" ("userId", "idempotency_key")
      WHERE "idempotency_key" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_ORDER_USER_IDEMPOTENCY"
    `);

    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "idempotency_key"
    `);
  }
}
