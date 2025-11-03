import { Controller, Get, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Role } from '../users/entities/role.enum';

@Controller('notification-test')
export class NotificationTestController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('health')
  async health() {
    return {
      status: 'ok',
      service: 'notification-test',
      timestamp: new Date().toISOString(),
      message: 'Notification test service is running',
    };
  }

  @Post('demo-admin-notification')
  async demoAdminNotification() {
    try {
      const result = await this.notificationService.sendToRole(Role.ADMIN, {
        type: 'system',
        title: 'Demo Admin Notification',
        message:
          'Testing admin notifications after bug fixes - all errors resolved!',
        data: {
          test: true,
          timestamp: new Date().toISOString(),
          fixes: [
            'SQL query fixes',
            'Seller service compilation errors',
            'Notification integration',
          ],
        },
        urgent: false,
        actionUrl: '/admin/dashboard',
      });

      return {
        success: true,
        message: 'Demo admin notification sent successfully',
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Demo admin notification failed',
        error: error.message,
      };
    }
  }

  @Post('demo-seller-verification')
  async demoSellerVerification() {
    try {
      // Test seller verification notification
      const result =
        await this.notificationService.notifySellerVerificationUpdate(1, true);

      return {
        success: true,
        message: 'Demo seller verification notification sent successfully',
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Demo seller verification notification failed',
        error: error.message,
      };
    }
  }

  @Post('demo-order-status')
  async demoOrderStatus() {
    try {
      // Test order status update notification
      const mockOrder = {
        id: 123,
        userId: 1,
        customer: { fullName: 'Test Customer' },
        orderItems: [
          {
            seller: { fullName: 'Test Seller' },
            product: { name: 'Test Product' },
            quantity: 2,
          },
        ],
      };

      const result = await this.notificationService.notifyOrderStatusUpdate(
        mockOrder,
        'pending',
        'shipped',
      );

      return {
        success: true,
        message: 'Demo order status notification sent successfully',
        result,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Demo order status notification failed',
        error: error.message,
      };
    }
  }

  @Post('demo-seller-order-notification')
  async demoSellerOrderNotification() {
    try {
      // Test order notification for a specific seller
      const mockOrder = {
        id: 999,
        userId: 1, // Customer ID
        totalAmount: 299.99,
        orderItems: [
          {
            sellerId: 2, // This seller should receive notification
            subtotal: 149.99,
            product: { name: 'Gaming Laptop' },
            quantity: 1,
          },
          {
            sellerId: 3, // This seller should also receive notification
            subtotal: 150.0,
            product: { name: 'Wireless Mouse' },
            quantity: 2,
          },
        ],
        shippingAddress: {
          fullName: 'Test Customer',
        },
      };

      // Use the same method that's called when real orders are placed
      const result =
        await this.notificationService.notifyOrderPlaced(mockOrder);

      return {
        success: true,
        message: 'Demo seller order notifications sent successfully',
        result,
        sellersNotified: [2, 3],
        orderId: mockOrder.id,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Demo seller order notification failed',
        error: error.message,
      };
    }
  }
}
