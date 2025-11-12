import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateWebhookEvents1762403618148 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'webhook_events',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'event_id',
                        type: 'varchar',
                        length: '255',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'event_type',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'payment_intent_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        length: '50',
                        default: "'pending'",
                    },
                    {
                        name: 'payload',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'processed_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Create index on payment_intent_id for faster lookups
        await queryRunner.query(
            `CREATE INDEX "IDX_WEBHOOK_PAYMENT_INTENT" ON "webhook_events" ("payment_intent_id")`
        );

        // Create index on event_id for idempotency checks
        await queryRunner.query(
            `CREATE INDEX "IDX_WEBHOOK_EVENT_ID" ON "webhook_events" ("event_id")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_WEBHOOK_EVENT_ID"`);
        await queryRunner.query(`DROP INDEX "IDX_WEBHOOK_PAYMENT_INTENT"`);
        await queryRunner.dropTable('webhook_events');
    }

}
