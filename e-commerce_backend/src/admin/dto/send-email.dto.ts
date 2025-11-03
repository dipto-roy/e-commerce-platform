import { IsString, IsArray, IsNotEmpty, IsOptional, IsEmail, ArrayMinSize } from 'class-validator';

export class SendEmailDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  recipients: string[];
}

export class SendBulkEmailDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  recipientType: 'all' | 'users' | 'sellers';
}
