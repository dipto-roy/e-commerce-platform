import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username or email address for login',
    example: 'test_user',
    minLength: 3,
    type: String,
  })
  @IsNotEmpty({ message: 'Email or username is required' })
  @IsString({ message: 'Email or username must be a string' })
  @MinLength(3, {
    message: 'Email or username must be at least 3 characters long',
  })
  email: string; // This field will accept both email and username

  @ApiProperty({
    description: 'User password',
    example: 'Test123!@#',
    minLength: 6,
    type: String,
    format: 'password',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
