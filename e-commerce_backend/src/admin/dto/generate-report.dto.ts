import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  SALES = 'sales',
  USERS = 'users',
  PRODUCTS = 'products',
  ORDERS = 'orders',
  REVENUE = 'revenue',
  INVENTORY = 'inventory',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

export class GenerateReportDto {
  @ApiProperty({
    enum: ReportType,
    description: 'Type of report to generate',
    example: ReportType.SALES,
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiPropertyOptional({
    enum: ReportFormat,
    description: 'Export format for the report',
    example: ReportFormat.PDF,
    default: ReportFormat.PDF,
  })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.PDF;

  @ApiPropertyOptional({
    description: 'Start date for filtering data (ISO format)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering data (ISO format)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
