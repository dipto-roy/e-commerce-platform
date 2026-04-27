import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserLoginDto {
  @ApiProperty({ description: 'Username', example: 'john_doe', minLength: 3, maxLength: 100 })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(100, { message: 'Username cannot exceed 100 characters' })
  username: string;

  @ApiProperty({ description: 'Password', example: 'securepassword123', minLength: 10, format: 'password' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(10, {
    message: 'Password must be at least 10 characters long!',
  })
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter!',
  })
  @IsString()
  password: string;
}
