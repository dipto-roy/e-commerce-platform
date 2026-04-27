import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductImageDto {
  @ApiProperty({ description: 'Image URL or file path', example: 'https://example.com/image.jpg' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Alt text for the image', example: 'Product front view' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Whether the image is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Display order of the image', example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateProductImageDto {
  @ApiPropertyOptional({ description: 'Image URL or file path', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Alt text for the image', example: 'Product front view' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Whether the image is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Display order of the image', example: 1 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
