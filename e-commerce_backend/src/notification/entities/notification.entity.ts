import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/unified-user.entity';

export enum NotificationType {
  ORDER = 'order',
  SELLER = 'seller',
  SYSTEM = 'system',
  PAYMENT = 'payment',
  PRODUCT = 'product',
  VERIFICATION = 'verification',
  PAYOUT = 'payout',
}

@Entity('notifications')
@Index(['userId', 'read']) // For efficient querying of unread notifications per user
@Index(['userId', 'createdAt']) // For efficient querying of recent notifications
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'boolean', default: false })
  urgent: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  actionUrl: string | null;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;
}
