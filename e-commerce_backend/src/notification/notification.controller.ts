import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService, NotificationData } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles.decorator/roles.decorator';
import { Role } from '../users/entities/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ======= PUBLIC TEST ENDPOINT (NO AUTH REQUIRED) =======
  @Post('test-public')
  async sendPublicTestNotification(@Body() data: any) {
    try {
      // Send a test notification to the public channels
      const testPayload = {
        type: data.type || 'system',
        title: data.title || 'Public Test Notification',
        message:
          data.message || 'This is a public test notification from Pusher',
        data: {
          timestamp: new Date().toISOString(),
          testId: Math.random().toString(36).substr(2, 9),
          ...data.data,
        },
        urgent: false,
      };

      // Send to public broadcast channel
      const result = await this.notificationService.sendBroadcast(testPayload);

      return {
        success: true,
        message: 'Public test notification sent successfully',
        payload: testPayload,
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send public test notification',
        error: error.message,
      };
    }
  }

  // ======= AUTHENTICATED ENDPOINTS BELOW =======

  // ======= USER NOTIFICATION CRUD ENDPOINTS =======

  // Get all notifications for current user (with pagination)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my')
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async getMyNotifications(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      console.log('📋 getMyNotifications called with:', {
        user,
        userId: user?.id,
        page,
        limit,
      });

      if (!user || !user.id) {
        throw new Error('User not found or invalid user ID');
      }

      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 20;

      console.log('📋 Fetching notifications with:', {
        userId: user.id,
        pageNum,
        limitNum,
      });

      const result = await this.notificationService.getUserNotifications(
        user.id,
        pageNum,
        limitNum,
      );

      console.log('📋 Notifications fetched successfully:', {
        count: result.notifications?.length || 0,
        total: result.total,
      });

      return result;
    } catch (error) {
      console.error('❌ Error in getMyNotifications:', error);
      throw error;
    }
  }

  // Get notifications for specific user (Admin only)
  @Get('user/:userId')
  @Roles(Role.ADMIN)
  async getUserNotifications(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pageNum = page || 1;
    const limitNum = limit || 20;
    return this.notificationService.getUserNotifications(
      userId,
      pageNum,
      limitNum,
    );
  }

  // Get unread count for current user
  @Get('my/unread-count')
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async getMyUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationService.getUnreadCount(user.id);
    return { unreadCount: count };
  }

  // Mark specific notification as read
  @Post(':id/read')
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async markNotificationAsRead(
    @Param('id', ParseIntPipe) notificationId: number,
    @CurrentUser() user: any,
  ) {
    try {
      const notification = await this.notificationService.markAsRead(
        notificationId,
        user.id,
      );
      return { success: true, notification };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mark all notifications as read for current user
  @Post('my/read-all')
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async markAllAsRead(@CurrentUser() user: any) {
    const result = await this.notificationService.markAllAsRead(user.id);
    return { success: true, ...result };
  }

  // Delete specific notification
  @Post(':id/delete')
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async deleteNotification(
    @Param('id', ParseIntPipe) notificationId: number,
    @CurrentUser() user: any,
  ) {
    try {
      await this.notificationService.deleteNotification(
        notificationId,
        user.id,
      );
      return { success: true, message: 'Notification deleted' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete all read notifications for current user
  @Post('my/delete-read')
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async deleteReadNotifications(@CurrentUser() user: any) {
    const result = await this.notificationService.deleteReadNotifications(
      user.id,
    );
    return { success: true, message: 'Read notifications deleted', ...result };
  }

  // Custom notification sending endpoint
  @Post('send')
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async sendCustomNotification(
    @Body() data: { userId: number; notification: NotificationData },
  ) {
    // Validate userId before calling service
    if (!data.userId || isNaN(Number(data.userId))) {
      return {
        success: false,
        error: `Invalid userId provided: ${data.userId}`,
      };
    }

    return this.notificationService.sendToUser(data.userId, data.notification);
  }

  // ======= ADMIN ENDPOINTS =======

  // Send notification to specific user (Admin only)
  @Post('send-to-user/:userId')
  @Roles(Role.ADMIN, Role.SELLER)
  @UsePipes(ValidationPipe)
  async sendToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() notification: NotificationData,
  ): Promise<
    | {
        success: boolean;
        channelName: string;
        eventName: string;
        error?: undefined;
      }
    | {
        success: boolean;
        error: any;
        channelName?: undefined;
        eventName?: undefined;
      }
  > {
    return this.notificationService.sendToUser(userId, notification);
  }

  // Send notification to multiple users (Admin only)
  @Post('send-to-users')
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async sendToUsers(
    @Body() data: { userIds: number[]; notification: NotificationData },
  ) {
    return this.notificationService.sendToUsers(
      data.userIds,
      data.notification,
    );
  }

  // Send notification to all users with specific role (Admin only)
  @Post('send-to-role/:role')
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async sendToRole(
    @Param('role') role: string,
    @Body() notification: NotificationData,
  ): Promise<{ successful: number; failed: number; total: number }> {
    return this.notificationService.sendToRole(role as Role, notification);
  }

  // Send broadcast notification (Admin only)
  @Post('broadcast')
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async sendBroadcast(@Body() notification: NotificationData) {
    return this.notificationService.sendBroadcast(notification);
  }

  // Send system maintenance notification (Admin only)
  @Post('system/maintenance')
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async notifySystemMaintenance(
    @Body()
    maintenanceData: {
      startTime: string;
      endTime: string;
      description: string;
    },
  ) {
    return this.notificationService.notifySystemMaintenance({
      startTime: new Date(maintenanceData.startTime),
      endTime: new Date(maintenanceData.endTime),
      description: maintenanceData.description,
    });
  }

  // ======= SELLER ENDPOINTS =======

  // Send test notification to current user
  @Post('test')
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  async sendTestNotification(@CurrentUser() user: any) {
    return this.notificationService.sendTestNotification(user.id);
  }

  // ======= E-COMMERCE SPECIFIC ENDPOINTS =======

  // Trigger order placed notification (Internal use / Admin)
  @Post('order/placed')
  @Roles(Role.USER)
  @UsePipes(ValidationPipe)
  async notifyOrderPlaced(@Body() order: any) {
    return this.notificationService.notifyOrderPlaced(order);
  }

  // Trigger order status update notification (Internal use / Admin)
  @Post('order/status-update')
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  @UsePipes(ValidationPipe)
  async notifyOrderStatusUpdate(
    @Body() data: { order: any; oldStatus: string; newStatus: string },
  ): Promise<void> {
    return this.notificationService.notifyOrderStatusUpdate(
      data.order,
      data.oldStatus,
      data.newStatus,
    );
  }

  // Trigger payment processed notification (Internal use / Admin)
  @Post('payment/processed')
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async notifyPaymentProcessed(@Body() payment: any) {
    return this.notificationService.notifyPaymentProcessed(payment);
  }

  // Trigger payment failed notification (Internal use / Admin)
  @Post('payment/failed')
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async notifyPaymentFailed(@Body() data: { payment: any; reason: string }) {
    return this.notificationService.notifyPaymentFailed(
      data.payment,
      data.reason,
    );
  }

  // Trigger seller verification update notification (Admin only)
  @Post('seller/verification-update')
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

  // Trigger payout processed notification (Admin only)
  @Post('payout/processed')
  @Roles(Role.ADMIN)
  @UsePipes(ValidationPipe)
  async notifyPayoutProcessed(
    @Body() data: { sellerId: number; payoutData: any },
  ) {
    return this.notificationService.notifyPayoutProcessed(
      data.sellerId,
      data.payoutData,
    );
  }

  // Trigger low stock alert notification (Admin or Seller)
  @Post('product/low-stock')
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

  // Trigger out of stock notification (Admin or Seller)
  @Post('product/out-of-stock')
  @Roles(Role.ADMIN, Role.SELLER)
  @UsePipes(ValidationPipe)
  async notifyProductOutOfStock(
    @Body() data: { sellerId?: number; product: any },
    @CurrentUser() user: any,
  ) {
    const sellerId =
      user.role === Role.ADMIN && data.sellerId ? data.sellerId : user.id;
    return this.notificationService.notifyProductOutOfStock(
      sellerId,
      data.product,
    );
  }

  // ======= PUSHER AUTHENTICATION =======

  // Authenticate user for private channels
  @Post('auth')
  @Roles(Role.ADMIN, Role.SELLER, Role.USER)
  @UsePipes(ValidationPipe)
  async authenticateUser(
    @Body() data: { socket_id: string; channel_name: string },
    @CurrentUser() user: any,
  ) {
    try {
      const auth = this.notificationService.authenticateUser(
        data.socket_id,
        data.channel_name,
        user.id,
      );
      return auth;
    } catch (error) {
      return { error: error.message };
    }
  }

  // ======= UTILITY ENDPOINTS =======

  // Health check for notification system
  @Get('health')
  @Roles(Role.ADMIN)
  async healthCheck() {
    return this.notificationService.healthCheck();
  }

  // Get notification system status
  @Get('status')
  @Roles(Role.ADMIN)
  async getStatus() {
    const health = await this.notificationService.healthCheck();
    return {
      service: 'NotificationService',
      pusher: {
        cluster: process.env.PUSHER_CLUSTER || 'ap2',
        configured: !!(
          process.env.PUSHER_APP_ID &&
          process.env.PUSHER_KEY &&
          process.env.PUSHER_SECRET
        ),
      },
      health,
    };
  }

  // ======= TEST ENDPOINTS =======

  @Post('test-order-notification')
  @Roles(Role.ADMIN)
  async testOrderNotification(@Body() testData: any) {
    // Create a mock order for testing
    const mockOrder = {
      id: testData.orderId || 123,
      userId: testData.userId || 1,
      totalAmount: testData.totalAmount || 99.99,
      orderItems: testData.orderItems || [
        {
          sellerId: testData.sellerId || 2,
          subtotal: 49.99,
          product: { name: 'Test Product' },
        },
        {
          sellerId: testData.sellerId2 || 3,
          subtotal: 50.0,
          product: { name: 'Another Product' },
        },
      ],
      shippingAddress: {
        fullName: testData.customerName || 'John Doe',
      },
    };

    try {
      await this.notificationService.notifyOrderPlaced(mockOrder);
      return {
        success: true,
        message: 'Test order notifications sent successfully',
        orderId: mockOrder.id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send test notifications',
        error: error.message,
      };
    }
  }

  @Post('test-admin-broadcast')
  @Roles(Role.ADMIN)
  async testAdminBroadcast(@Body() notification: any) {
    try {
      const result = await this.notificationService.sendToRole(Role.ADMIN, {
        type: 'system',
        title: notification.title || 'Admin Test Notification',
        message:
          notification.message || 'This is a test notification for all admins',
        data: notification.data || {},
        urgent: notification.urgent || false,
        actionUrl: '/admin/dashboard',
      });

      return {
        success: true,
        message: 'Admin broadcast sent',
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send admin broadcast',
        error: error.message,
      };
    }
  }
}
