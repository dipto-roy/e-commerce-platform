import {
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  IsOptional,
  IsBoolean,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductImageDto } from './image.dto';

export class ProductDto {
  @ApiProperty({ description: 'User/Seller ID who owns the product', example: 'SELLER_123456' })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @ApiProperty({ description: 'Product name', example: 'Wireless Bluetooth Headphones', maxLength: 80 })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(80, { message: 'Product name must not exceed 80 characters' })
  name: string;

  @ApiProperty({ description: 'Product description', example: 'High quality wireless headphones with noise cancellation', maxLength: 1200 })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(1200, { message: 'Description must not exceed 1200 characters' })
  description: string;

  @ApiProperty({ description: 'Product price', example: 29.99, minimum: 0.01 })
  @IsNotEmpty({ message: 'Price is required' })
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(0.01, { message: 'Price must be at least 0.01' })
  price: number;

  @ApiPropertyOptional({ description: 'Whether the product is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Product images', type: [CreateProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}

// NEW: DTO for creating products without userId (extracted from JWT)
export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Wireless Bluetooth Headphones', maxLength: 80 })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  @MaxLength(80, { message: 'Product name must not exceed 80 characters' })
  name: string;

  @ApiProperty({ description: 'Product description', example: 'High quality wireless headphones with noise cancellation', maxLength: 1200 })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(1200, { message: 'Description must not exceed 1200 characters' })
  description: string;

  @ApiProperty({ description: 'Product price', example: 29.99, minimum: 0.01 })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return value || 0;
  })
  @IsNotEmpty({ message: 'Price is required' })
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(0.01, { message: 'Price must be at least 0.01' })
  price: number;

  @ApiPropertyOptional({ description: 'Stock quantity', example: 100, minimum: 0 })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return value || 0;
  })
  @IsOptional()
  @IsPositive({ message: 'Stock quantity must be a positive number' })
  @Min(0, { message: 'Stock quantity must be at least 0' })
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'Product category', example: 'Electronics', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Category must not exceed 50 characters' })
  category?: string;

  @Transform(({ value }) => {
    console.log('🔄 Transform isActive input:', value, typeof value);
    if (typeof value === 'string') {
      const result =
        value === 'true' || value === '1' || value.toLowerCase() === 'true';
      console.log('🔄 Transform isActive result:', result);
      return result;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    // Default to true if undefined or null
    return value != null ? Boolean(value) : true;
  })
  @ApiPropertyOptional({ description: 'Whether the product is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Product images', type: [CreateProductImageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product name', example: 'Updated Product Name', maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80, { message: 'Product name must not exceed 80 characters' })
  name?: string;

  @ApiPropertyOptional({ description: 'Product description', maxLength: 1200 })
  @IsOptional()
  @IsString()
  @MaxLength(1200, { message: 'Description must not exceed 1200 characters' })
  description?: string;

  @ApiPropertyOptional({ description: 'Product price', example: 19.99, minimum: 0.01 })
  @IsOptional()
  @IsPositive({ message: 'Price must be a positive number' })
  @Min(0.01, { message: 'Price must be at least 0.01' })
  price?: number;

  @ApiPropertyOptional({ description: 'Whether the product is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Image URL', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Stock quantity', example: 50, minimum: 0 })
  @IsOptional()
  @Min(0, { message: 'Stock must be a non-negative number' })
  stock?: number;

  @ApiPropertyOptional({ description: 'Product category', example: 'Electronics', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Category must not exceed 100 characters' })
  category?: string;
}
