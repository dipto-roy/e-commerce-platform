import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Param,
  Post,
  Query,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { OrderService } from '../order/order.service';
import { UpdateOrderStatusDto } from '../order/dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles.decorator/roles.decorator';
import { Role } from '../users/entities/role.enum';
import {
  VerifySellerDto,
  RejectSellerDto,
} from './dto/seller-verification.dto';
import { SendEmailDto, SendBulkEmailDto } from './dto/send-email.dto';
import {
  GetTrendsQueryDto,
  DashboardTrendsResponseDto,
  TrendPeriod,
} from './dto/dashboard-trends.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly orderService: OrderService,
  ) {}

  @Get()
  getAdminInfo(): string {
    return this.adminService.getAdminInfo();
  }

  @Get('getadmin')
  getAdminNameandId(
    @Query('name') name: string,
    @Query('id') id: number,
  ): object {
    return this.adminService.getAdminNameandId(name, id);
  }

  @Post('addadmin')
  addAdmin(@Body() admindata: object): object {
    return this.adminService.addAdmin(admindata);
  }

  @Delete('delete/:id')
  deleteAdmin(@Param('id') id: number): object {
    return this.adminService.deleteAdmin(id);
  }

  @Put('getadmin/:id')
  updateAdmin(@Param('id') id: number, @Body() updateData: object): object {
    return this.adminService.updateAdmin(id, updateData);
  }

  @Patch('getadmin/:id')
  patchAdmin(@Param('id') id: number, @Body() updateData: object): object {
    return this.adminService.updateAdmin(id, updateData);
  }

  // Seller verification endpoints
  @Get('sellers/pending')
  async getPendingSellers() {
    return await this.adminService.getPendingSellers();
  }

  @Get('sellers/verified')
  async getVerifiedSellers() {
    return await this.adminService.getVerifiedSellers();
  }

  @Post('sellers/:id/verify')
  @UsePipes(ValidationPipe)
  async verifySeller(
    @Param('id') sellerId: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() verifyDto: VerifySellerDto = {},
  ) {
    return await this.adminService.verifySeller(Number(sellerId));
  }

  @Post('sellers/:id/reject')
  @UsePipes(ValidationPipe)
  async rejectSeller(
    @Param('id') sellerId: number,
    @Body() rejectDto: RejectSellerDto,
  ) {
    return await this.adminService.rejectSeller(
      Number(sellerId),
      rejectDto.deleteAccount || false,
    );
  }

  // Admin order management endpoints
  @Get('orders')
  async getOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('status') status: string = '',
    @Req() req: any,
  ) {
    const adminUser = {
      id: req.user.id,
      role: Role.ADMIN,
    };
    return await this.orderService.findAll(adminUser, page, limit);
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: number,
    @Body() updateDto: UpdateOrderStatusDto,
    @Req() req: any,
  ) {
    const adminUser = {
      id: req.user.id,
      role: Role.ADMIN,
    };
    return await this.orderService.updateStatus(id, updateDto, adminUser);
  }

  // Email endpoints
  @Post('emails/send')
  @UsePipes(ValidationPipe)
  async sendEmail(@Body() emailDto: SendEmailDto) {
    return await this.adminService.sendEmailToUsers(
      emailDto.subject,
      emailDto.message,
      emailDto.recipients,
    );
  }

  @Post('emails/send-bulk')
  @UsePipes(ValidationPipe)
  async sendBulkEmail(@Body() bulkEmailDto: SendBulkEmailDto) {
    return await this.adminService.sendBulkEmail(
      bulkEmailDto.subject,
      bulkEmailDto.message,
      bulkEmailDto.recipientType,
    );
  }

  @Get('emails/history')
  async getEmailHistory() {
    return await this.adminService.getEmailHistory();
  }

  @Get('dashboard/trends')
  @ApiOperation({
    summary: 'Get dashboard trend data for charts',
    description:
      'Returns time-series data for users, sellers, and products over a specified period',
  })
  @ApiQuery({
    name: 'period',
    enum: TrendPeriod,
    required: false,
    description: 'Time period for trends (7days, 30days, 3months, 1year)',
    example: '7days',
  })
  @ApiResponse({
    status: 200,
    description: 'Trends data retrieved successfully',
    type: DashboardTrendsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getDashboardTrends(@Query() query: GetTrendsQueryDto) {
    const trends = await this.adminService.getDashboardTrends(query.period);

    return {
      success: true,
      ...trends,
    };
  }
}
