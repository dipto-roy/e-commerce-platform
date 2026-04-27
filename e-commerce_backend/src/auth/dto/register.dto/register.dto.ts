import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Username (unique)', example: 'john_doe', minLength: 3, maxLength: 100 })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(100, { message: 'Username cannot exceed 100 characters' })
  username: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ description: 'Password (min 6 characters)', example: 'password123', minLength: 6, format: 'password' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '01712345678' })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Invalid phone number format' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Full name', example: 'John Doe', maxLength: 150 })
  @IsOptional()
  @IsString({ message: 'Full name must be a string' })
  @MaxLength(150, { message: 'Full name cannot exceed 150 characters' })
  fullName?: string;

  @ApiProperty({ description: 'User role', enum: ['USER', 'ADMIN', 'SELLER'], example: 'USER' })
  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['USER', 'ADMIN', 'SELLER'], {
    message: 'Role must be one of: USER, ADMIN, SELLER',
  })
  role: string;
}
