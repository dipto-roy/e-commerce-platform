import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/unified-user.entity';
import { Role } from '../users/entities/role.enum';
import * as Pusher from 'pusher';
import { Order } from 'src/order/entities/order.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Notification, NotificationType } from './entities/notification.entity';

export interface NotificationData {
  type:
    | 'order'
    | 'payment'
    | 'verification'
    | 'payout'
    | 'product'
    | 'system'
    | 'seller';
  title: string;
  message: string;
  data?: Record<string, any>;
  urgent?: boolean;
  actionUrl?: string;
}

@Injectable()
export class NotificationService {
  async sendOrderNotificationToSeller(sellerId: number, order: Order) {
    // Validate sellerId
    if (!sellerId || isNaN(Number(sellerId))) {
      this.logger.error(`Invalid sellerId provided: ${sellerId}`);
      return { success: false, error: 'Invalid seller ID' };
    }

    // Validate order
    if (!order || !order.orderItems) {
      this.logger.error(`Invalid order provided:`, order);
      return { success: false, error: 'Invalid order data' };
    }

    const sellerItems = order.orderItems.filter(
      (item: any) => item.sellerId === sellerId,
    );
    const sellerTotal = sellerItems.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0,
    );

    return await this.sendToUser(Number(sellerId), {
      type: 'order',
      title: 'New Order Received',
      message: `You have a new order! Order #${order.id} - Items: ${sellerItems.length}, Value: $${sellerTotal}`,
      data: {
        orderId: order.id,
        itemsCount: sellerItems.length,
        sellerTotal,
      },
      urgent: true,
      actionUrl: `/seller/orders/${order.id}`,
    });
  }
  private readonly logger = new Logger(NotificationService.name);
  private pusher: Pusher;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {
    // Initialize Pusher with environment variables
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || '',
      key: process.env.PUSHER_KEY || '',
      secret: process.env.PUSHER_SECRET || '',
      cluster: process.env.PUSHER_CLUSTER || 'ap2',
      useTLS: true,
    });

    // Log Pusher configuration (without secret)
    this.logger.log(
      `Pusher configured for cluster: ${process.env.PUSHER_CLUSTER || 'ap2'}`,
    );
  }

  // ======= CORE NOTIFICATION METHODS =======

  // Send notification to specific user
  async sendToUser(userId: number, notification: NotificationData) {
    try {
      // Validate inputs
      if (!userId || isNaN(Number(userId))) {
        this.logger.error(`Invalid userId provided: ${userId}`);
        return { success: false, error: 'Invalid user ID' };
      }

      if (!notification || !notification.type) {
        this.logger.error(`Invalid notification data provided:`, notification);
        return { success: false, error: 'Invalid notification data' };
      }

      // Ensure userId is a valid number
      const validUserId = Number(userId);

      // Save notification to database
      const savedNotification = await this.createNotification(
        validUserId,
        notification,
      );

      // Send real-time notification via Pusher
      const channelName = `user-${validUserId}`; // Changed from private-user-${userId} to match frontend
      const eventName = 'new-notification';

      const payload = {
        ...notification,
        id: savedNotification.id,
        timestamp: savedNotification.createdAt.toISOString(),
        userId: validUserId,
        read: false,
      };

      await this.pusher.trigger(channelName, eventName, payload);

      this.logger.log(
        `Notification sent to user ${validUserId}: ${notification.title}`,
      );
      return {
        success: true,
        channelName,
        eventName,
        notificationId: savedNotification.id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send notification to user ${userId}:`,
        error,
      );
      return { success: false, error: errorMessage };
    }
  }

  // ======= DATABASE OPERATIONS =======

  // Create and save notification to database
  async createNotification(
    userId: number,
    notificationData: NotificationData,
  ): Promise<Notification> {
    // Validate inputs
    if (!userId || isNaN(Number(userId))) {
      throw new Error(`Invalid userId for notification: ${userId}`);
    }

    if (!notificationData || !notificationData.type) {
      throw new Error(
        `Invalid notification data: ${JSON.stringify(notificationData)}`,
      );
    }

    const notification = this.notificationRepository.create({
      userId: Number(userId),
      type: notificationData.type as any,
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || null,
      urgent: notificationData.urgent || false,
      actionUrl: notificationData.actionUrl || null,
      read: false,
    });

    return await this.notificationRepository.save(notification);
  }

  // Get all notifications for a user with pagination
  async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ) {
    try {
      console.log('🔍 getUserNotifications service called:', {
        userId,
        userIdType: typeof userId,
        page,
        limit,
      });

      const [notifications, total] =
        await this.notificationRepository.findAndCount({
          where: { userId },
          order: { createdAt: 'DESC' },
          skip: (page - 1) * limit,
          take: limit,
        });

      console.log('✅ Notifications query successful:', {
        count: notifications.length,
        total,
      });

      return {
        notifications,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('❌ Error in getUserNotifications service:', error);
      throw error;
    }
  }

  // Get unread notifications count for a user
  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, read: false },
    });
  }

  // Mark notification as read
  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    notification.readAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: number): Promise<{ affected: number }> {
    const result = await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );

    return { affected: result.affected || 0 };
  }

  // Delete a specific notification
  async deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if (result.affected === 0) {
      throw new Error('Notification not found');
    }
  }

  // Delete all read notifications for a user
  async deleteReadNotifications(userId: number): Promise<{ affected: number }> {
    const result = await this.notificationRepository.delete({
      userId,
      read: true,
    });

    return { affected: result.affected || 0 };
  }

  // Send notification to multiple users
  async sendToUsers(userIds: number[], notification: NotificationData) {
    const results = await Promise.allSettled(
      userIds.map((userId) => this.sendToUser(userId, notification)),
    );

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;
    const failed = results.length - successful;

    this.logger.log(
      `Bulk notification sent: ${successful} successful, ${failed} failed`,
    );
    return { successful, failed, total: results.length };
  }

  // Send notification to all users with specific role
  async sendToRole(role: Role, notification: NotificationData) {
    const users = await this.userRepository.find({
      where: { role, isActive: true },
      select: ['id'],
    });

    const userIds = users.map((user) => user.id);
    return this.sendToUsers(userIds, notification);
  }

  // Broadcast notification to all users
  async sendBroadcast(notification: NotificationData) {
    try {
      const channelName = 'broadcast'; // Changed from public-notifications to match frontend
      const eventName = `broadcast-${notification.type}`;

      const payload = {
        ...notification,
        timestamp: new Date().toISOString(),
        broadcast: true,
      };

      await this.pusher.trigger(channelName, eventName, payload);

      this.logger.log(`Broadcast notification sent: ${notification.title}`);
      return { success: true, channelName, eventName };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Failed to send broadcast notification:', error);
      return { success: false, error: errorMessage };
    }
  }

  // ======= E-COMMERCE SPECIFIC NOTIFICATION METHODS =======

  // Order-related notifications
  async notifyOrderPlaced(order: any) {
    try {
      this.logger.log(`Starting order notifications for order #${order.id}`);

      // Notify customer
      await this.sendToUser(order.userId, {
        type: 'order',
        title: 'Order Placed Successfully',
        message: `Your order #${order.id} has been placed successfully. Total: $${order.totalAmount}`,
        data: { orderId: order.id, amount: order.totalAmount },
        actionUrl: `/orders/${order.id}`,
      });

      // Notify sellers involved in the order
      const sellerIds = [
        ...new Set(
          order.orderItems
            .map((item: any) => item.sellerId)
            .filter((id: any) => id && !isNaN(Number(id)) && Number(id) > 0),
        ),
      ];

      this.logger.log(`Valid seller IDs found: ${sellerIds.length}`);

      for (const sellerId of sellerIds) {
        // Additional validation before processing
        if (!sellerId || isNaN(Number(sellerId))) {
          this.logger.warn(
            `Skipping invalid sellerId in notifyOrderPlaced: ${sellerId}`,
          );
          continue;
        }

        const sellerItems = order.orderItems.filter(
          (item: any) => item.sellerId === sellerId,
        );
        const sellerTotal = sellerItems.reduce(
          (sum: number, item: any) => sum + item.subtotal,
          0,
        );

        await this.sendToUser(Number(sellerId), {
          type: 'order',
          title: 'New Order Received',
          message: `You have a new order! Order #${order.id} - Items: ${sellerItems.length}, Value: $${sellerTotal}`,
          data: {
            orderId: order.id,
            itemsCount: sellerItems.length,
            sellerTotal,
            customerName: order.shippingAddress.fullName,
          },
          urgent: true,
          actionUrl: `/seller/orders/${order.id}`,
        });
      }

      // Notify all admins about the new order
      await this.sendToRole(Role.ADMIN, {
        type: 'order',
        title: 'New Order Placed',
        message: `New order #${order.id} placed by ${order.shippingAddress.fullName}. Total: $${order.totalAmount}`,
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          customerName: order.shippingAddress.fullName,
          itemsCount: order.orderItems.length,
          sellersCount: sellerIds.length,
        },
        urgent: false,
        actionUrl: `/admin/orders/${order.id}`,
      });

      this.logger.log(
        `Order notifications sent for order #${order.id} to customer, ${sellerIds.length} sellers, and all admins`,
      );

      return { success: true, notificationsCount: sellerIds.length + 2 }; // +2 for customer and admin
    } catch (error) {
      this.logger.error(
        `Failed to send order notifications for order #${order.id}:`,
        error,
      );
      return { success: false, error: error.message };
    }
  }

  async notifyOrderStatusUpdate(
    order: any,
    oldStatus: string,
    newStatus: string,
  ) {
    // Notify customer about status change
    await this.sendToUser(order.userId, {
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order #${order.id} status changed from ${oldStatus} to ${newStatus}`,
      data: { orderId: order.id, oldStatus, newStatus },
      actionUrl: `/orders/${order.id}`,
    });

    // Notify admins about status change
    await this.sendToRole(Role.ADMIN, {
      type: 'order',
      title: 'Order Status Updated',
      message: `Order #${order.id} status changed from ${oldStatus} to ${newStatus}`,
      data: {
        orderId: order.id,
        oldStatus,
        newStatus,
        customerName: order.shippingAddress?.fullName,
      },
      actionUrl: `/admin/orders/${order.id}`,
    });

    // If order is delivered, notify seller
    if (newStatus === 'DELIVERED') {
      const sellerIds = [
        ...new Set(
          order.orderItems
            .map((item: any) => item.sellerId)
            .filter((id: any) => id && !isNaN(Number(id)) && Number(id) > 0),
        ),
      ];

      this.logger.log(
        `Notifying ${sellerIds.length} sellers about delivered order #${order.id}`,
      );

      for (const sellerId of sellerIds) {
        // Validate sellerId before processing
        if (!sellerId || isNaN(Number(sellerId))) {
          this.logger.warn(
            `Skipping invalid sellerId in notifyOrderStatusUpdate: ${sellerId}`,
          );
          continue;
        }

        await this.sendToUser(Number(sellerId), {
          type: 'order',
          title: 'Order Delivered',
          message: `Order #${order.id} has been delivered successfully. Earnings will be processed.`,
          data: { orderId: order.id },
          actionUrl: `/seller/financial/records`,
        });
      }
    }
  }

  // Payment notifications
  async notifyPaymentProcessed(payment: any) {
    await this.sendToUser(payment.order.userId, {
      type: 'payment',
      title: 'Payment Processed',
      message: `Payment of $${payment.amount} for order #${payment.order.id} has been processed successfully`,
      data: {
        paymentId: payment.id,
        orderId: payment.order.id,
        amount: payment.amount,
        method: payment.paymentMethod?.type || 'Unknown',
      },
      actionUrl: `/orders/${payment.order.id}`,
    });
  }

  async notifyPaymentFailed(payment: any, reason: string) {
    await this.sendToUser(payment.order.userId, {
      type: 'payment',
      title: 'Payment Failed',
      message: `Payment of $${payment.amount} for order #${payment.order.id} has failed. Reason: ${reason}`,
      data: {
        paymentId: payment.id,
        orderId: payment.order.id,
        amount: payment.amount,
        reason,
      },
      urgent: true,
      actionUrl: `/orders/${payment.order.id}/payment`,
    });
  }

  // Seller verification notifications
  async notifySellerVerificationUpdate(sellerId: number, isVerified: boolean) {
    await this.sendToUser(sellerId, {
      type: 'verification',
      title: isVerified
        ? 'Seller Account Verified'
        : 'Seller Verification Revoked',
      message: isVerified
        ? 'Congratulations! Your seller account has been verified. You can now access all seller features.'
        : 'Your seller verification has been revoked. Please contact support for assistance.',
      data: { isVerified },
      urgent: true,
      actionUrl: '/seller/profile',
    });
  }

  // Payout notifications
  async notifyPayoutProcessed(sellerId: number, payoutData: any) {
    await this.sendToUser(sellerId, {
      type: 'payout',
      title: 'Payout Processed',
      message: `Your payout of $${payoutData.amount} has been processed successfully via ${payoutData.method}`,
      data: {
        amount: payoutData.amount,
        method: payoutData.method,
        reference: payoutData.reference,
        recordsCount: payoutData.recordsCount,
      },
      actionUrl: '/seller/financial/payouts',
    });
  }

  // Product notifications
  async notifyLowStock(sellerId: number, products: any[]) {
    const productNames = products.map((p) => p.name).join(', ');

    await this.sendToUser(sellerId, {
      type: 'product',
      title: 'Low Stock Alert',
      message: `${products.length} product(s) are running low on stock: ${productNames}`,
      data: {
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
        })),
        count: products.length,
      },
      urgent: true,
      actionUrl: '/seller/products',
    });
  }

  async notifyProductOutOfStock(sellerId: number, product: any) {
    await this.sendToUser(sellerId, {
      type: 'product',
      title: 'Product Out of Stock',
      message: `Your product "${product.name}" is now out of stock and has been automatically deactivated`,
      data: { productId: product.id, productName: product.name },
      urgent: true,
      actionUrl: `/seller/products/${product.id}`,
    });
  }

  // System notifications
  async notifySystemMaintenance(maintenanceData: {
    startTime: Date;
    endTime: Date;
    description: string;
  }) {
    await this.sendBroadcast({
      type: 'system',
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled from ${maintenanceData.startTime} to ${maintenanceData.endTime}. ${maintenanceData.description}`,
      data: maintenanceData,
      urgent: true,
    });
  }

  async sendTestNotification(userId: number) {
    await this.sendToUser(userId, {
      type: 'system',
      title: 'Test Notification',
      message:
        'This is a test notification to verify the system is working correctly.',
      data: { test: true, timestamp: new Date().toISOString() },
    });
  }

  // Get Pusher authentication for private channels
  authenticateUser(socketId: string, channelName: string, userId: number) {
    // Verify the user has permission to access this channel
    // Note: Using 'user-' prefix to match the channel naming in sendToUser
    if (
      channelName === `private-user-${userId}` ||
      channelName === `user-${userId}`
    ) {
      return this.pusher.authenticate(socketId, channelName);
    }

    throw new Error('Unauthorized channel access');
  }

  // Health check for Pusher connection
  async healthCheck() {
    try {
      // Send a test event to verify Pusher connection
      await this.pusher.trigger('health-check', 'ping', {
        timestamp: new Date().toISOString(),
      });
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Pusher health check failed:', error);
      return {
        status: 'unhealthy',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
