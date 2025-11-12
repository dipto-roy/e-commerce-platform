import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_WEBHOOK_EVENT_ID', { unique: true })
  @Column({ name: 'event_id', type: 'varchar', length: 255, unique: true })
  eventId: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Index('IDX_WEBHOOK_PAYMENT_INTENT')
  @Column({ name: 'payment_intent_id', type: 'varchar', length: 255, nullable: true })
  paymentIntentId: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: any;

  @Column({ name: 'processed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
