import {
  IsString,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SellerDto {
  @ApiProperty({ description: 'Username (unique)', example: 'seller_shop', minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(100, { message: 'Username cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({ description: 'Full name of seller', example: 'Jane Smith', minLength: 2, maxLength: 150 })
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(150, { message: 'Full name cannot exceed 150 characters' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Full name can only contain letters and spaces',
  })
  fullName: string;

  @ApiPropertyOptional({ description: 'Legacy name field', example: 'Shop Name' })
  @IsOptional()
  @Matches(/^[a-zA-Z0-9 ]+$/, {
    message: 'Name must not contain any special characters!',
  })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Password (min 10 chars)', example: 'sellerpassword123', minLength: 10, format: 'password' })
  @IsNotEmpty()
  @MinLength(10, {
    message: 'Password must be at least 10 characters long!',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter!',
  })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Phone number (starts with 01)', example: '01812345678' })
  @IsNotEmpty()
  @Matches(/^01\d+$/, {
    message: 'Phone number field must start with 01!',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Whether seller is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
