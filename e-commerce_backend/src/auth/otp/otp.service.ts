import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { OtpToken } from '../entities/otp-token.entity';
import { User } from '../../users/entities/unified-user.entity';
import { MaillerService } from '../../mailler/mailler.service';

@Injectable()
export class OtpService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    @InjectRepository(OtpToken)
    private otpTokenRepository: Repository<OtpToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private maillerService: MaillerService,
  ) {}

  /**
   * Generate a secure 6-digit OTP
   */
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Send OTP for forgot password
   */
  async sendForgotPasswordOTP(
    email: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<{ message: string; expiresIn: number }> {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // For security, don't reveal if email exists
      return {
        message: 'If the email exists, an OTP has been sent',
        expiresIn: this.OTP_EXPIRY_MINUTES * 60,
      };
    }

    // Check if email is verified - only send OTP to verified emails
    if (!user.isVerified) {
      throw new BadRequestException(
        'Email address is not verified. Please verify your email before resetting password. Check your inbox for the verification email.',
      );
    }

    // Generate OTP
    const otp = this.generateOTP();
    const otpHash = await argon2.hash(otp);

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    // Invalidate any existing OTPs for this user and purpose
    await this.otpTokenRepository.update(
      { userId: user.id, purpose: 'forgot-password', verified: false },
      { verified: true }, // Mark as used
    );

    // Create new OTP token
    const otpToken = this.otpTokenRepository.create({
      userId: user.id,
      email: user.email,
      otpHash,
      purpose: 'forgot-password',
      expiresAt,
      ipAddress,
      userAgent,
    });

    await this.otpTokenRepository.save(otpToken);

    // Send email
    await this.maillerService.sendForgotPasswordOTP(
      user.email,
      otp,
      this.OTP_EXPIRY_MINUTES,
    );

    return {
      message: 'If the email exists, an OTP has been sent',
      expiresIn: this.OTP_EXPIRY_MINUTES * 60,
    };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(
    email: string,
    otp: string,
  ): Promise<{ valid: boolean; token?: string }> {
    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Invalid OTP');
    }

    // Find active OTP token
    const otpToken = await this.otpTokenRepository.findOne({
      where: {
        userId: user.id,
        purpose: 'forgot-password',
        verified: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpToken) {
      throw new NotFoundException(
        'No active OTP found. Please request a new one.',
      );
    }

    // Check expiry
    if (new Date() > otpToken.expiresAt) {
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    // Check max attempts
    if (otpToken.attempts >= this.MAX_ATTEMPTS) {
      await this.otpTokenRepository.update(otpToken.id, { verified: true });
      throw new UnauthorizedException(
        'Maximum verification attempts exceeded. Please request a new OTP.',
      );
    }

    // Increment attempts
    await this.otpTokenRepository.update(otpToken.id, {
      attempts: otpToken.attempts + 1,
    });

    // Verify OTP
    const isValid = await argon2.verify(otpToken.otpHash, otp);

    if (!isValid) {
      const attemptsLeft = this.MAX_ATTEMPTS - (otpToken.attempts + 1);
      throw new UnauthorizedException(
        `Invalid OTP. ${attemptsLeft} attempts remaining.`,
      );
    }

    // Mark as verified
    await this.otpTokenRepository.update(otpToken.id, { verified: true });

    // Generate reset token (short-lived JWT-like token)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await argon2.hash(resetToken);

    // Store reset token in OTP record for validation
    await this.otpTokenRepository.update(otpToken.id, {
      otpHash: resetTokenHash, // Reuse field to store reset token
    });

    return {
      valid: true,
      token: resetToken,
    };
  }

  /**
   * Reset password using verified token
   */
  async resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Invalid reset request');
    }

    // Find verified OTP token
    const otpToken = await this.otpTokenRepository.findOne({
      where: {
        userId: user.id,
        purpose: 'forgot-password',
        verified: true,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpToken) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    // Verify reset token (stored in otpHash field after verification)
    const isValid = await argon2.verify(otpToken.otpHash, resetToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid reset token');
    }

    // Check if token is still within valid timeframe (10 minutes after OTP verification)
    const tokenAge = new Date().getTime() - otpToken.createdAt.getTime();
    const maxTokenAge = this.OTP_EXPIRY_MINUTES * 60 * 1000;
    if (tokenAge > maxTokenAge) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await argon2.hash(newPassword);

    // Update user password
    await this.userRepository.update(user.id, { password: hashedPassword });

    // Invalidate the token
    await this.otpTokenRepository.delete(otpToken.id);

    return { message: 'Password reset successful' };
  }

  /**
   * Cleanup expired OTP tokens (can be run as a cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.otpTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }
}
