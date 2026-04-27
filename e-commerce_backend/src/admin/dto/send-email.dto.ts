import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ description: 'Email subject', example: 'Important Platform Update' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Email message body', example: 'Dear user, we have some exciting updates...' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ description: 'List of recipient email addresses', example: ['user@example.com'], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  recipients: string[];
}

export class SendBulkEmailDto {
  @ApiProperty({ description: 'Email subject', example: 'Platform Announcement' })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Email message body', example: 'Dear users, important announcement...' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ description: 'Recipient type', enum: ['all', 'users', 'sellers'], example: 'all' })
  @IsNotEmpty()
  @IsString()
  recipientType: 'all' | 'users' | 'sellers';
}
