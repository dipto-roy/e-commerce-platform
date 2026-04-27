import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Product ID to order', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'Quantity to order', example: 2, minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class ShippingAddressDto {
  @ApiProperty({ description: 'Full name of recipient', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Phone number', example: '01712345678' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Address line 1', example: '123 Main Street' })
  @IsNotEmpty()
  @IsString()
  line1: string;

  @ApiPropertyOptional({ description: 'Address line 2', example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ description: 'City', example: 'Dhaka' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ description: 'State/Division', example: 'Dhaka Division' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ description: 'Postal code', example: '1205' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Country', example: 'Bangladesh' })
  @IsNotEmpty()
  @IsString()
  country: string;
}

export class CreateOrderFromCartDto {
  @ApiProperty({ description: 'Shipping address', type: ShippingAddressDto })
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @ApiPropertyOptional({ description: 'Payment method', enum: ['cod', 'stripe'], example: 'cod' })
  @IsOptional()
  @IsString()
  @IsIn(['cod', 'stripe'], {
    message: 'Payment method must be either cod or stripe',
  })
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Order notes', example: 'Please deliver before 5pm' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Order items', type: [CreateOrderItemDto] })
  @IsNotEmpty()
  items: CreateOrderItemDto[];

  @ApiProperty({ description: 'Shipping address', type: ShippingAddressDto })
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ description: 'Payment method', example: 'cod' })
  @IsNotEmpty()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Order notes', example: 'Handle with care' })
  notes?: string;
}
