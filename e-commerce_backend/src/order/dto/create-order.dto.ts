import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class ShippingAddressDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  state: string;

  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}

export class CreateOrderFromCartDto {
  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @IsOptional()
  @IsString()
  @IsIn(['cod', 'stripe'], {
    message: 'Payment method must be either cod or stripe',
  })
  paymentMethod?: string; // 'cod' or 'stripe'

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  items: CreateOrderItemDto[];

  @IsNotEmpty()
  shippingAddress: ShippingAddressDto;

  @IsNotEmpty()
  paymentMethod: string; // 'cod', 'card', 'mobile_banking', etc.

  notes?: string;
}
