import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum TrendPeriod {
  SEVEN_DAYS = '7days',
  THIRTY_DAYS = '30days',
  THREE_MONTHS = '3months',
  ONE_YEAR = '1year',
}

export class GetTrendsQueryDto {
  @ApiProperty({
    description: 'Time period for trends',
    enum: TrendPeriod,
    default: TrendPeriod.SEVEN_DAYS,
    required: false,
    example: '7days',
  })
  @IsEnum(TrendPeriod)
  @IsOptional()
  period?: TrendPeriod = TrendPeriod.SEVEN_DAYS;
}

export class TrendDataPoint {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2025-11-03',
  })
  date: string;

  @ApiProperty({
    description: 'Total users on this date',
    example: 95,
  })
  users: number;

  @ApiProperty({
    description: 'Total sellers on this date',
    example: 20,
  })
  sellers: number;

  @ApiProperty({
    description: 'Total products on this date',
    example: 140,
  })
  products: number;
}

export class DashboardTrendsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Trend data points',
    type: [TrendDataPoint],
    example: [
      { date: '2025-11-01', users: 95, sellers: 18, products: 140 },
      { date: '2025-11-02', users: 97, sellers: 19, products: 145 },
      { date: '2025-11-03', users: 100, sellers: 20, products: 150 },
    ],
  })
  data: TrendDataPoint[];

  @ApiProperty({
    description: 'Time period',
    example: '7days',
  })
  period: string;

  @ApiProperty({
    description: 'Start date',
    example: '2025-10-27',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date',
    example: '2025-11-03',
  })
  endDate: string;
}
