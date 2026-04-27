import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VerifySellerDto {
  @ApiPropertyOptional({ description: 'Whether to send notification email', default: false })
  @IsOptional()
  @IsBoolean()
  notify?: boolean;
}

export class RejectSellerDto {
  @ApiPropertyOptional({ description: 'Whether to delete account or just deactivate', default: false })
  @IsOptional()
  @IsBoolean()
  deleteAccount?: boolean = false;

  @ApiPropertyOptional({ description: 'Reason for rejection', example: 'Incomplete documentation' })
  @IsOptional()
  reason?: string;
}
