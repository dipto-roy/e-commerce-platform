import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, CreateOrderFromCartDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles.decorator/roles.decorator';
import { Role } from '../users/entities/role.enum';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  @ApiResponse({ status: 403, description: 'Authentication required' })
  @UsePipes(ValidationPipe)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: any,
  ) {
    // Only authenticated users can create orders
    if (!req.user || !req.user.id) {
      throw new ForbiddenException('Authentication required to place order');
    }

    return this.orderService.createOrder(createOrderDto, req.user.id);
  }

  @Post('from-cart')
  @ApiOperation({ summary: 'Create order from shopping cart' })
  @ApiResponse({ status: 201, description: 'Order created from cart' })
  @ApiResponse({ status: 400, description: 'Invalid cart data' })
  @UsePipes(ValidationPipe)
  async createOrderFromCart(
    @Body() createOrderFromCartDto: CreateOrderFromCartDto,
    @Request() req: any,
  ) {
    // Only authenticated users can create orders
    if (!req.user || !req.user.id) {
      throw new ForbiddenException('Authentication required to place order');
    }

    return this.orderService.createOrderFromCart(
      req.user.id,
      createOrderFromCartDto,
    );
  }

  @Get('stats')
  async getUserOrderStats(@Request() req: any) {
    return this.orderService.getUserOrderStats(req.user);
  }

  @Get()
  async getAllOrders(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.orderService.findAll(req.user, pageNum, limitNum);
  }

  @Get('seller/financials')
  @UseGuards(RolesGuard)
  @Roles(Role.SELLER)
  async getSellerFinancials(@Request() req: any) {
    return this.orderService.getSellerFinancials(req.user.id);
  }

  @Get('seller/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  async getSellerOrders(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.orderService.getSellerOrders(req.user.id, pageNum, limitNum);
  }

  @Get(':id')
  async getOrder(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.orderService.findOne(id, req.user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @UsePipes(ValidationPipe)
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateOrderStatusDto,
    @Request() req: any,
  ) {
    return this.orderService.updateStatus(id, updateDto, req.user);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.orderService.cancelOrder(id, req.user);
  }

  @Post(':id/create-payment-intent')
  @ApiOperation({ summary: 'Create Stripe payment intent for order' })
  @ApiResponse({ status: 200, description: 'Payment intent created' })
  async createPaymentIntent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    return this.orderService.createPaymentIntent(id, req.user.id);
  }
}
