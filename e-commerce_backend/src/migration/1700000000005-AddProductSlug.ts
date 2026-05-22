import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductSlug1700000000005 implements MigrationInterface {
  name = 'AddProductSlug1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`,
    );
    await queryRunner.query(
      `UPDATE products
       SET slug = LOWER(
         REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9 -]', '', 'g'), '\\s+', '-', 'g')
       )
       WHERE slug IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_products_slug`);
    await queryRunner.query(
      `ALTER TABLE products DROP COLUMN IF EXISTS slug`,
    );
  }
}
