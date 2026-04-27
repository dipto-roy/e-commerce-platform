import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsIn,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../entities/role.enum';

export class CreateUserDto {
  @ApiProperty({ description: 'Username (unique)', example: 'john_doe', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(100, { message: 'Username cannot exceed 100 characters' })
  username: string;

  @ApiPropertyOptional({ description: 'Full name', example: 'John Doe', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'Full name cannot exceed 150 characters' })
  fullName?: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({ description: 'Password (min 10 chars, must contain lowercase)', example: 'securepassword123', minLength: 10 })
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Password must be at least 10 characters long!',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter!',
  })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Phone number (must start with 01)', example: '01712345678' })
  @IsNotEmpty()
  @Matches(/^01\d+$/, {
    message: 'Phone number field must start with 01!',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'User role', enum: ['USER', 'ADMIN', 'SELLER'], default: 'USER' })
  @IsOptional()
  @IsIn(['USER', 'ADMIN', 'SELLER'], {
    message: 'Role must be one of: USER, ADMIN, SELLER',
  })
  role?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Username', example: 'john_doe_updated', minLength: 3, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(100, { message: 'Username cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'newemail@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '01798765432' })
  @IsOptional()
  @Matches(/^01\d+$/, {
    message: 'Phone number field must start with 01!',
  })
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'User role', enum: ['USER', 'ADMIN', 'SELLER'] })
  @IsOptional()
  @IsIn(['USER', 'ADMIN', 'SELLER'], {
    message: 'Role must be one of: USER, ADMIN, SELLER',
  })
  role?: string;

  @ApiPropertyOptional({ description: 'Whether user is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  username: string;

  @ApiProperty({ description: 'Email', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'Phone number', example: '01712345678' })
  phone: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({ description: 'Whether user is active', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Account creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
