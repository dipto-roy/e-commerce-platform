import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService, NotificationData } from './notification.service';
import { NotificationSseService } from './notification-sse.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles.decorator/roles.decorator';
import { Role } from '../users/entities/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationSseService: NotificationSseService,
  ) {}

  // ─── SSE STREAM ──────────────────────────────────────────────────────────────

  /** Real-time notification stream for authenticated users. */
  @Get('sse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  @Sse()
  streamNotifications(@CurrentUser() user: any): Observable<MessageEvent> {
    return this.notificationSseService.subscribe(user.id);
  }

  // ─── USER CRUD ────────────────────────────────────────────────────────────────

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async getMyNotifications(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!user?.id) return { success: false, error: 'Unauthenticated' };
    return this.notificationService.getUserNotifications(
      user.id,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('my/unread-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async getMyUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationService.getUnreadCount(user.id);
    return { unreadCount: count };
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async markNotificationAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    try {
      const notification = await this.notificationService.markAsRead(id, user.id);
      return { success: true, notification };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  @Post('my/read-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async markAllAsRead(@CurrentUser() user: any) {
    const result = await this.notificationService.markAllAsRead(user.id);
    return { success: true, ...result };
  }

  @Post(':id/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async deleteNotification(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    try {
      await this.notificationService.deleteNotification(id, user.id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  @Post('my/delete-read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async deleteReadNotifications(@CurrentUser() user: any) {
    const result = await this.notificationService.deleteReadNotifications(user.id);
    return { success: true, ...result };
  }

  @Post('test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async sendTestNotification(@CurrentUser() user: any) {
    return this.notificationService.sendTestNotification(user.id);
  }

  // ─── ADMIN ───────────────────────────────────────────────────────────────────

  /** Admin: aggregate stats for the notification dashboard. */
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAdminStats() {
    return this.notificationService.getAdminNotificationStats();
  }

  /** Admin: view any user's notifications. */
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getUserNotifications(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.getUserNotifications(
      userId,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async sendCustomNotification(
    @Body() data: { userId: number; notification: NotificationData },
  ) {
    if (!data.userId || isNaN(Number(data.userId)))
      return { success: false, error: `Invalid userId: ${data.userId}` };
    return this.notificationService.sendToUser(data.userId, data.notification);
  }

  @Post('send-to-user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @UsePipes(ValidationPipe)
  async sendToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() notification: NotificationData,
  ) {
    return this.notificationService.sendToUser(userId, notification);
  }

  @Post('send-to-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async sendToUsers(
    @Body() data: { userIds: number[]; notification: NotificationData },
  ) {
    return this.notificationService.sendToUsers(data.userIds, data.notification);
  }

  @Post('send-to-role/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async sendToRole(
    @Param('role') role: string,
    @Body() notification: NotificationData,
  ) {
    return this.notificationService.sendToRole(role as Role, notification);
  }

  @Post('broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async sendBroadcast(@Body() notification: NotificationData) {
    return this.notificationService.sendBroadcast(notification);
  }

  @Post('system/maintenance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async notifySystemMaintenance(
    @Body() body: { startTime: string; endTime: string; description: string },
  ) {
    return this.notificationService.notifySystemMaintenance({
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      description: body.description,
    });
  }

  @Get('health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  healthCheck() {
    return this.notificationService.healthCheck();
  }

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getStatus() {
    return {
      service: 'NotificationService',
      transport: 'SSE',
      health: this.notificationService.healthCheck(),
    };
  }

  // ─── E-COMMERCE DOMAIN TRIGGERS ───────────────────────────────────────────────

  @Post('order/placed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @UsePipes(ValidationPipe)
  async notifyOrderPlaced(@Body() order: any) {
    return this.notificationService.notifyOrderPlaced(order);
  }

  @Post('order/status-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  @UsePipes(ValidationPipe)
  async notifyOrderStatusUpdate(
    @Body() data: { order: any; oldStatus: string; newStatus: string },
  ) {
    return this.notificationService.notifyOrderStatusUpdate(
      data.order,
      data.oldStatus,
      data.newStatus,
    );
  }

  @Post('payment/processed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async notifyPaymentProcessed(@Body() payment: any) {
    return this.notificationService.notifyPaymentProcessed(payment);
  }

  @Post('payment/failed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async notifyPaymentFailed(@Body() data: { payment: any; reason: string }) {
    return this.notificationService.notifyPaymentFailed(data.payment, data.reason);
  }

  @Post('seller/verification-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async notifySellerVerificationUpdate(
    @Body() data: { sellerId: number; isVerified: boolean },
  ) {
    return this.notificationService.notifySellerVerificationUpdate(
      data.sellerId,
      data.isVerified,
    );
  }

  @Post('payout/processed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async notifyPayoutProcessed(@Body() data: { sellerId: number; payoutData: any }) {
    return this.notificationService.notifyPayoutProcessed(
      data.sellerId,
      data.payoutData,
    );
  }

  @Post('product/low-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @UsePipes(ValidationPipe)
  async notifyLowStock(
    @Body() data: { sellerId?: number; products: any[] },
    @CurrentUser() user: any,
  ) {
    const sellerId =
      user.role === Role.ADMIN && data.sellerId ? data.sellerId : user.id;
    return this.notificationService.notifyLowStock(sellerId, data.products);
  }

  @Post('product/out-of-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @UsePipes(ValidationPipe)
  async notifyProductOutOfStock(
    @Body() data: { sellerId?: number; product: any },
    @CurrentUser() user: any,
  ) {
    const sellerId =
      user.role === Role.ADMIN && data.sellerId ? data.sellerId : user.id;
    return this.notificationService.notifyProductOutOfStock(sellerId, data.product);
  }

  // ─── PUBLIC TEST (dev/staging only) ──────────────────────────────────────────

  @Post('test-public')
  async sendPublicTestNotification(@Body() data: any) {
    try {
      const payload: NotificationData = {
        type: data.type ?? 'system',
        title: data.title ?? 'Public Test Notification',
        message: data.message ?? 'This is a public test notification',
        data: { timestamp: new Date().toISOString(), ...data.data },
        urgent: false,
      };
      const result = await this.notificationService.sendBroadcast(payload);
      return { success: true, payload, result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  @Post('test-order-notification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async testOrderNotification(@Body() testData: any) {
    const mockOrder = {
      id: testData.orderId ?? 123,
      userId: testData.userId ?? 1,
      totalAmount: testData.totalAmount ?? 99.99,
      orderItems: testData.orderItems ?? [
        { sellerId: testData.sellerId ?? 2, subtotal: 49.99, product: { name: 'Test Product' } },
      ],
      shippingAddress: { fullName: testData.customerName ?? 'John Doe' },
    };
    try {
      await this.notificationService.notifyOrderPlaced(mockOrder);
      return { success: true, message: 'Test notifications sent', orderId: mockOrder.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  @Post('test-admin-broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async testAdminBroadcast(@Body() body: any) {
    return this.notificationService.sendToRole(Role.ADMIN, {
      type: 'system',
      title: body.title ?? 'Admin Test Notification',
      message: body.message ?? 'Test notification for all admins',
      data: body.data ?? {},
      urgent: body.urgent ?? false,
      actionUrl: '/dashboard/admin',
    });
  }
}
