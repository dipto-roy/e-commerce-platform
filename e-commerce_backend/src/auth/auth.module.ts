/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthServiceNew } from './auth-new.service';
import { AuthController } from './auth.controller';
import { AuthControllerNew } from './auth-new.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/unified-user.entity';
import { LoginLog } from './entities/login-log.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { OtpToken } from './entities/otp-token.entity';
import { OAuthAccount } from './entities/oauth-account.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy/jwt.strategy';
import { RefreshTokenStrategy } from './jwt.strategy/refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { OtpService } from './otp/otp.service';
import { MaillerService } from '../mailler/mailler.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      LoginLog,
      RefreshToken,
      OtpToken,
      OAuthAccount,
    ]),
    PassportModule,
    // Rate limiting for OTP endpoints
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 3, // 3 requests per minute
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'fallback_secret_key',
        signOptions: {
          expiresIn:
            configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthServiceNew,
    JwtStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    OtpService,
    MaillerService,
  ],
  controllers: [AuthController], // Using updated controller with AuthServiceNew
  exports: [
    AuthService,
    AuthServiceNew,
    JwtStrategy,
    PassportModule,
    OtpService,
  ],
})
export class AuthModule {}
