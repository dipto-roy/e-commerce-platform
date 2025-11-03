import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/unified-user.entity';

@Entity('otp_tokens')
export class OtpToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  email: string;

  @Column()
  otpHash: string; // Argon2 hashed OTP for security

  @Column({ default: 'forgot-password' })
  purpose: string; // 'forgot-password', 'email-verification', etc.

  @Column({ default: false })
  verified: boolean;

  @Column({ default: 0 })
  attempts: number; // Track verification attempts

  @Column({ type: 'timestamp' })
  expiresAt: Date; // OTP expiration (10 minutes from creation)

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'inet', nullable: true })
  ipAddress: string; // Track IP for security

  @Column({ type: 'text', nullable: true })
  userAgent: string; // Track user agent
}
