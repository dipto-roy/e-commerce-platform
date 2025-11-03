import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateOtpTokensTable1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create otp_tokens table
    await queryRunner.createTable(
      new Table({
        name: 'otp_tokens',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'otpHash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'purpose',
            type: 'varchar',
            length: '50',
            default: "'forgot-password'",
          },
          {
            name: 'verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'ipAddress',
            type: 'inet',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'otp_tokens',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes for performance
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_tokens_userId" ON "otp_tokens" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_tokens_email" ON "otp_tokens" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_otp_tokens_expiresAt" ON "otp_tokens" ("expiresAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('otp_tokens');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('otp_tokens', foreignKey);
    }

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_otp_tokens_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_otp_tokens_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_otp_tokens_expiresAt"`);

    // Drop table
    await queryRunner.dropTable('otp_tokens');
  }
}
