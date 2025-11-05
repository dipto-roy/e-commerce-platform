/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Res,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
  Ip,
  Headers,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthServiceNew } from './auth-new.service'; // Use the newer service
import { RegisterDto } from './dto/register.dto/register.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import {
  ForgotPasswordDto,
  VerifyOtpDto,
  ResetPasswordDto,
} from './dto/forgot-password.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { OtpService } from './otp/otp.service';
import { STATUS_CODES } from 'http';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthServiceNew,
    private readonly otpService: OtpService,
  ) {} // Updated to use AuthServiceNew

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with email verification',
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or user already exists',
  })
  @UsePipes(ValidationPipe)
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.register(registerDto);

    // No automatic token generation in the new service for registration
    return result;
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user and receive JWT tokens in cookies',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Login credentials (username/email and password)',
    examples: {
      user: {
        summary: 'Login with username',
        value: {
          email: 'test_user',
          password: 'Test123!@#',
        },
      },
      email: {
        summary: 'Login with email',
        value: {
          email: 'test@example.com',
          password: 'Test123!@#',
        },
      },
    },
  })
  @ApiHeader({
    name: 'user-agent',
    description: 'User agent string (automatically provided by browser/client)',
    required: false,
    schema: {
      type: 'string',
      default: 'PostmanRuntime/7.x',
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Login successful, tokens set in cookies and returned in response',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Login successful',
        },
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'JWT access token (valid for 15 minutes)',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description: 'JWT refresh token (valid for 7 days)',
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            username: { type: 'string', example: 'test_user' },
            email: { type: 'string', example: 'test@example.com' },
            role: { type: 'string', example: 'USER' },
            fullName: { type: 'string', example: 'Test User' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or seller pending verification',
  })
  @UsePipes(ValidationPipe)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    try {
      const result = await this.authService.login(loginDto, ip, userAgent);

      // Set HTTP-only cookies for both tokens
      response.cookie('access_token', result.tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      response.cookie('refresh_token', result.tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Return tokens in response body for Postman/API testing
      return {
        message: result.message,
        access_token: result.tokens.access_token,
        refresh_token: result.tokens.refresh_token,
        statusCode: 201,
        user: result.user,
      };
    } catch (error) {
      // Check if it's a seller verification error
      if (error.message && error.message.includes('pending verification')) {
        throw new UnauthorizedException({
          message: error.message,
          needsVerification: true,
        });
      }
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() request: any) {
    return {
      user: request.user,
    };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Logout user by revoking refresh token and clearing cookies. Works even without tokens.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful, all tokens cleared',
  })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Get refresh token from cookies
    const refreshToken = request.cookies?.refresh_token;

    // Revoke refresh token in database if it exists
    if (refreshToken) {
      try {
        await this.authService.logout(refreshToken);
      } catch (error) {
        console.warn('Failed to revoke refresh token:', error.message);
        // Continue with logout even if revocation fails
      }
    }

    // Clear both access_token and refresh_token cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    response.clearCookie('access_token', cookieOptions);
    response.clearCookie('refresh_token', cookieOptions);

    return {
      message: 'Logged out successfully',
      statusCode: 200,
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generate new access and refresh tokens using valid refresh token from cookies',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Tokens refreshed successfully',
        },
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token not found, invalid, expired, or revoked',
  })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found in cookies');
    }

    try {
      // Validate and generate new token pair using the refresh token
      const tokens = await this.authService.refreshTokens(
        refreshToken,
        ip,
        userAgent,
      );

      // Set new HTTP-only cookies with secure settings
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
      };

      response.cookie('access_token', tokens.access_token, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      response.cookie('refresh_token', tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        message: 'Tokens refreshed successfully',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        statusCode: 200,
      };
    } catch (error) {
      // Clear cookies on error
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
      };

      response.clearCookie('access_token', cookieOptions);
      response.clearCookie('refresh_token', cookieOptions);

      console.error('❌ Refresh token error:', error.message);
      throw new UnauthorizedException(
        'Invalid, expired, or revoked refresh token',
      );
    }
  }

  /**
   * OTP FORGOT PASSWORD ENDPOINTS
   */

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 🔒 Rate limit: 3 requests per 15 minutes
  @ApiOperation({
    summary: 'Request password reset OTP',
    description:
      'Send OTP to user email for password reset. Rate limited to 3 requests per 15 minutes per IP.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully to email',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'OTP sent to your email',
        },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @UsePipes(ValidationPipe)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return await this.otpService.sendForgotPasswordOTP(
      forgotPasswordDto.email,
      ip,
      userAgent,
    );
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 🔒 Rate limit: 5 attempts per 15 minutes
  @ApiOperation({
    summary: 'Verify OTP',
    description:
      'Verify OTP code for password reset. Rate limited to 5 attempts per 15 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified, reset token issued',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many attempts - rate limit exceeded',
  })
  @UsePipes(ValidationPipe)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.otpService.verifyOTP(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 🔒 Rate limit: 3 requests per 15 minutes
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Reset password using valid reset token. Rate limited to 3 requests per 15 minutes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  @UsePipes(ValidationPipe)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.otpService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.resetToken,
      resetPasswordDto.newPassword,
    );
  }

  /**
   * GOOGLE OAUTH2 ENDPOINTS
   */

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // User data is available in req.user after Google strategy validation
    const { user, isNewUser } = req.user;

    // Generate JWT tokens
    const tokens = await this.authService.generateTokenPair(
      user,
      ip,
      userAgent,
    );

    // Set HTTP-only cookies
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend with success message
    const redirectUrl = isNewUser
      ? `${process.env.FRONTEND_URL}/dashboard?oauth=success&new=true`
      : `${process.env.FRONTEND_URL}/dashboard?oauth=success`;

    response.redirect(redirectUrl);
  }
}
