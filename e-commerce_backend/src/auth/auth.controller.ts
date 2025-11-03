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
  @ApiResponse({
    status: 200,
    description: 'Login successful, tokens set in cookies',
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

      return {
        message: result.message,
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
  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear both access_token and refresh_token cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    };

    response.clearCookie('access_token', cookieOptions);
    response.clearCookie('refresh_token', cookieOptions);

    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      // Generate new token pair using the refresh token
      const tokens = await this.authService.refreshTokens(
        refreshToken,
        ip,
        userAgent,
      );

      // Set new HTTP-only cookies
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

      return {
        message: 'Tokens refreshed successfully',
      };
    } catch (error) {
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * OTP FORGOT PASSWORD ENDPOINTS
   */

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 requests per 15 minutes
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
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 attempts per 15 minutes
  @UsePipes(ValidationPipe)
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.otpService.verifyOTP(
      verifyOtpDto.email,
      verifyOtpDto.otp,
    );
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 requests per 15 minutes
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
