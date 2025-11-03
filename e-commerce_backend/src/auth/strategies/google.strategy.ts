import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/unified-user.entity';
import { OAuthAccount, OAuthProvider } from '../entities/oauth-account.entity';
import { Role } from '../../users/entities/role.enum';
import { MaillerService } from '../../mailler/mailler.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OAuthAccount)
    private readonly oauthAccountRepository: Repository<OAuthAccount>,
    private readonly maillerService: MaillerService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    // Use dummy values if OAuth credentials are not configured
    // This prevents the strategy from crashing the app
    // OAuth endpoints will return 401 if strategy is not properly configured
    super({
      clientID: clientID || 'dummy-client-id',
      clientSecret: clientSecret || 'dummy-client-secret',
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:4002/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    });

    if (!clientID || !clientSecret) {
      console.log(
        '⚠️  Google OAuth credentials not configured - OAuth endpoints will not work',
      );
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id: providerId, emails, displayName, photos } = profile;

      if (!emails || emails.length === 0) {
        return done(new Error('No email found in Google profile'), null);
      }

      const email = emails[0].value;
      const username = displayName || email.split('@')[0];
      const profilePicture =
        photos && photos.length > 0 ? photos[0].value : null;

      // Check if OAuth account already exists
      let oauthAccount = await this.oauthAccountRepository.findOne({
        where: {
          provider: OAuthProvider.GOOGLE,
          providerId,
        },
        relations: ['user'],
      });

      let user: User;
      let isNewUser = false;

      if (oauthAccount) {
        // OAuth account exists - return existing user
        user = oauthAccount.user;

        // Check if user is a seller - sellers cannot use OAuth2
        if (user.role === Role.SELLER) {
          return done(
            new Error(
              'Seller accounts cannot use Google sign-in. Sellers require admin approval and must use email/password login.',
            ),
            null,
          );
        }

        // Update last used timestamp
        oauthAccount.lastUsedAt = new Date();
        await this.oauthAccountRepository.save(oauthAccount);
      } else {
        // Check if user with this email already exists
        user = await this.userRepository.findOne({ where: { email } });

        if (user) {
          // Check if existing user is a seller - sellers cannot use OAuth2
          if (user.role === Role.SELLER) {
            return done(
              new Error(
                'This email is registered as a seller account. Sellers cannot use Google sign-in and must use email/password login.',
              ),
              null,
            );
          }

          // User exists - link OAuth account to existing user
          oauthAccount = this.oauthAccountRepository.create({
            provider: OAuthProvider.GOOGLE,
            providerId,
            userId: user.id,
            providerEmail: email,
            providerProfile: {
              displayName,
              profilePicture,
            },
            accessToken, // Note: Encrypt in production
            refreshToken, // Note: Encrypt in production
            lastUsedAt: new Date(),
          });

          await this.oauthAccountRepository.save(oauthAccount);

          console.log(
            `Linked Google account ${providerId} to existing user ${user.id}`,
          );
        } else {
          // Create new user
          isNewUser = true;

          user = this.userRepository.create({
            email,
            username: await this.generateUniqueUsername(username),
            password: '', // No password for OAuth users (or generate random secure one)
            fullName: displayName,
            role: Role.USER,
            isActive: true,
            isVerified: true, // OAuth users are pre-verified
          });

          user = await this.userRepository.save(user);

          // Create OAuth account
          oauthAccount = this.oauthAccountRepository.create({
            provider: OAuthProvider.GOOGLE,
            providerId,
            userId: user.id,
            providerEmail: email,
            providerProfile: {
              displayName,
              profilePicture,
            },
            accessToken,
            refreshToken,
            lastUsedAt: new Date(),
          });

          await this.oauthAccountRepository.save(oauthAccount);

          console.log(`Created new user ${user.id} from Google OAuth`);

          // Send welcome email for new OAuth users
          try {
            await this.maillerService.sendOAuthWelcomeEmail(
              user.email,
              user.username,
              'Google',
            );
          } catch (emailError) {
            console.error('Failed to send OAuth welcome email:', emailError);
            // Don't fail authentication if email fails
          }
        }
      }

      // Return user data for JWT generation
      const payload = {
        user,
        isNewUser,
        oauthProvider: OAuthProvider.GOOGLE,
      };

      return done(null, payload);
    } catch (error) {
      console.error('Google OAuth validation error:', error);
      return done(error, null);
    }
  }

  /**
   * Generate unique username by appending numbers if username exists
   */
  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername;
    let counter = 1;

    while (await this.userRepository.findOne({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }
}
