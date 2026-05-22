import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from '../users/entities/unified-user.entity';
import { Role } from '../users/entities/role.enum';
import { Order } from 'src/order/entities/order.entity';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationSseService } from './notification-sse.service';

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
  data?: Record<string, unknown>;
  urgent?: boolean;
  actionUrl?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly sseService: NotificationSseService,
  ) {}

  // ─── CORE DELIVERY ───────────────────────────────────────────────────────────

  /** Persist + deliver a notification to one user via SSE (if connected). */
  async sendToUser(
    userId: number,
    notification: NotificationData,
  ): Promise<{ success: boolean; notificationId?: number; error?: string }> {
    if (!userId || isNaN(Number(userId))) {
      this.logger.error(`Invalid userId: ${userId}`);
      return { success: false, error: 'Invalid user ID' };
    }
    if (!notification?.type) {
      this.logger.error(`Invalid notification data`, notification);
      return { success: false, error: 'Invalid notification data' };
    }

    try {
      const validUserId = Number(userId);
      const saved = await this.createNotification(validUserId, notification);

      const delivered = this.sseService.emit(validUserId, {
        id: saved.id,
        type: saved.type,
        title: saved.title,
        message: saved.message,
        data: saved.data ?? {},
        urgent: saved.urgent,
        actionUrl: saved.actionUrl,
        timestamp: saved.createdAt.toISOString(),
        userId: validUserId,
        read: false,
      });

      this.logger.log(
        `Notification sent to user ${validUserId}: "${notification.title}" | SSE delivered: ${delivered}`,
      );
      return { success: true, notificationId: saved.id };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to notify user ${userId}:`, error);
      return { success: false, error: msg };
    }
  }

  /** Deliver to multiple users in parallel. */
  async sendToUsers(
    userIds: number[],
    notification: NotificationData,
  ): Promise<{ successful: number; failed: number; total: number }> {
    const results = await Promise.allSettled(
      userIds.map((id) => this.sendToUser(id, notification)),
    );
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;
    this.logger.log(
      `Bulk notification: ${successful}/${results.length} sent`,
    );
    return { successful, failed: results.length - successful, total: results.length };
  }

  /** Deliver to every active user with the given role. */
  async sendToRole(
    role: Role,
    notification: NotificationData,
  ): Promise<{ successful: number; failed: number; total: number }> {
    const users = await this.userRepository.find({
      where: { role, isActive: true },
      select: ['id'],
    });
    return this.sendToUsers(
      users.map((u) => u.id),
      notification,
    );
  }

  /**
   * Broadcast — persists for every user and delivers via SSE to currently
   * connected clients. Non-connected users will see it on next fetch.
   */
  async sendBroadcast(
    notification: NotificationData,
  ): Promise<{ success: boolean; delivered: number; error?: string }> {
    try {
      const users = await this.userRepository.find({
        where: { isActive: true },
        select: ['id'],
      });

      const payload: Record<string, unknown> = {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data ?? {},
        urgent: notification.urgent ?? false,
        actionUrl: notification.actionUrl ?? null,
        timestamp: new Date().toISOString(),
        broadcast: true,
      };

      // Save to DB for all users
      await Promise.allSettled(
        users.map((u) => this.createNotification(u.id, notification)),
      );

      // Push to currently connected users
      const delivered = this.sseService.emitToAll(payload);
      this.logger.log(
        `Broadcast "${notification.title}" — persisted: ${users.length}, SSE delivered: ${delivered}`,
      );
      return { success: true, delivered };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Broadcast failed:', error);
      return { success: false, delivered: 0, error: msg };
    }
  }

  // ─── DATABASE OPERATIONS ─────────────────────────────────────────────────────

  async createNotification(
    userId: number,
    data: NotificationData,
  ): Promise<Notification> {
    if (!userId || isNaN(Number(userId)))
      throw new Error(`Invalid userId: ${userId}`);
    if (!data?.type)
      throw new Error(`Invalid notification data: ${JSON.stringify(data)}`);

    const entity = this.notificationRepository.create({
      userId: Number(userId),
      type: data.type as unknown as NotificationType,
      title: data.title,
      message: data.message,
      data: data.data ?? null,
      urgent: data.urgent ?? false,
      actionUrl: data.actionUrl ?? null,
      read: false,
    });
    return this.notificationRepository.save(entity);
  }

  async getUserNotifications(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({ where: { userId, read: false } });
  }

  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new Error('Notification not found');
    notification.read = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<{ affected: number }> {
    const result = await this.notificationRepository.update(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );
    return { affected: result.affected ?? 0 };
  }

  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    const result = await this.notificationRepository.delete({ id: notificationId, userId });
    if (result.affected === 0) throw new Error('Notification not found');
  }

  async deleteReadNotifications(userId: number): Promise<{ affected: number }> {
    const result = await this.notificationRepository.delete({ userId, read: true });
    return { affected: result.affected ?? 0 };
  }

  // ─── ADMIN STATS ─────────────────────────────────────────────────────────────

  async getAdminNotificationStats(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    recentCount: number;
    connectedUsers: number;
  }> {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [total, unread, recentCount, byTypeRaw] = await Promise.all([
      this.notificationRepository.count(),
      this.notificationRepository.count({ where: { read: false } }),
      this.notificationRepository.count({ where: { createdAt: MoreThan(yesterday) } }),
      this.notificationRepository
        .createQueryBuilder('n')
        .select('n.type', 'type')
        .addSelect('COUNT(n.id)', 'count')
        .groupBy('n.type')
        .getRawMany<{ type: string; count: string }>(),
    ]);

    const byType = byTypeRaw.reduce<Record<string, number>>((acc, row) => {
      acc[row.type] = parseInt(row.count, 10);
      return acc;
    }, {});

    return {
      total,
      unread,
      byType,
      recentCount,
      connectedUsers: this.sseService.getConnectionCount(),
    };
  }

  // ─── E-COMMERCE DOMAIN NOTIFICATIONS ─────────────────────────────────────────

  async sendOrderNotificationToSeller(sellerId: number, order: Order) {
    if (!sellerId || isNaN(Number(sellerId)))
      return { success: false, error: 'Invalid seller ID' };
    if (!order?.orderItems)
      return { success: false, error: 'Invalid order data' };

    const sellerItems = order.orderItems.filter(
      (item: any) => item.sellerId === sellerId,
    );
    const sellerTotal = sellerItems.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0,
    );

    return this.sendToUser(Number(sellerId), {
      type: 'order',
      title: 'New Order Received',
      message: `Order #${order.id} — ${sellerItems.length} item(s), $${sellerTotal}`,
      data: { orderId: order.id, itemsCount: sellerItems.length, sellerTotal },
      urgent: true,
      actionUrl: `/seller/orders/${order.id}`,
    });
  }

  async notifyOrderPlaced(order: any) {
    try {
      // Notify customer
      await this.sendToUser(order.userId, {
        type: 'order',
        title: 'Order Placed Successfully',
        message: `Your order #${order.id} has been placed. Total: $${order.totalAmount}`,
        data: { orderId: order.id, amount: order.totalAmount },
        actionUrl: `/orders/${order.id}`,
      });

      // Notify involved sellers
      const sellerIds = [
        ...new Set<number>(
          order.orderItems
            .map((item: any) => item.sellerId)
            .filter((id: any) => id && !isNaN(Number(id)) && Number(id) > 0),
        ),
      ];

      for (const sellerId of sellerIds) {
        const items = order.orderItems.filter((i: any) => i.sellerId === sellerId);
        const total = items.reduce((s: number, i: any) => s + i.subtotal, 0);
        await this.sendToUser(Number(sellerId), {
          type: 'order',
          title: 'New Order Received',
          message: `Order #${order.id} — ${items.length} item(s), $${total}`,
          data: {
            orderId: order.id,
            itemsCount: items.length,
            sellerTotal: total,
            customerName: order.shippingAddress?.fullName,
          },
          urgent: true,
          actionUrl: `/seller/orders/${order.id}`,
        });
      }

      // Notify admins
      await this.sendToRole(Role.ADMIN, {
        type: 'order',
        title: 'New Order Placed',
        message: `Order #${order.id} by ${order.shippingAddress?.fullName}. Total: $${order.totalAmount}`,
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          customerName: order.shippingAddress?.fullName,
          itemsCount: order.orderItems.length,
          sellersCount: sellerIds.length,
        },
        actionUrl: `/dashboard/admin/orders`,
      });

      this.logger.log(
        `Order #${order.id} notifications sent to customer + ${sellerIds.length} seller(s) + admins`,
      );
      return { success: true, notificationsCount: sellerIds.length + 2 };
    } catch (error) {
      this.logger.error(`Failed to notify order #${order.id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  async notifyOrderStatusUpdate(order: any, oldStatus: string, newStatus: string) {
    await this.sendToUser(order.userId, {
      type: 'order',
      title: 'Order Status Updated',
      message: `Order #${order.id} changed: ${oldStatus} → ${newStatus}`,
      data: { orderId: order.id, oldStatus, newStatus },
      actionUrl: `/orders/${order.id}`,
    });

    await this.sendToRole(Role.ADMIN, {
      type: 'order',
      title: 'Order Status Updated',
      message: `Order #${order.id}: ${oldStatus} → ${newStatus}`,
      data: { orderId: order.id, oldStatus, newStatus, customerName: order.shippingAddress?.fullName },
      actionUrl: `/dashboard/admin/orders`,
    });

    if (newStatus === 'DELIVERED') {
      const sellerIds = [
        ...new Set<number>(
          order.orderItems
            .map((i: any) => i.sellerId)
            .filter((id: any) => id && !isNaN(Number(id))),
        ),
      ];
      for (const sellerId of sellerIds) {
        await this.sendToUser(Number(sellerId), {
          type: 'order',
          title: 'Order Delivered',
          message: `Order #${order.id} delivered. Earnings will be processed.`,
          data: { orderId: order.id },
          actionUrl: `/seller/financial/records`,
        });
      }
    }
  }

  async notifyPaymentProcessed(payment: any) {
    await this.sendToUser(payment.order.userId, {
      type: 'payment',
      title: 'Payment Processed',
      message: `Payment of $${payment.amount} for order #${payment.order.id} processed`,
      data: { paymentId: payment.id, orderId: payment.order.id, amount: payment.amount },
      actionUrl: `/orders/${payment.order.id}`,
    });
  }

  async notifyPaymentFailed(payment: any, reason: string) {
    await this.sendToUser(payment.order.userId, {
      type: 'payment',
      title: 'Payment Failed',
      message: `Payment of $${payment.amount} for order #${payment.order.id} failed. Reason: ${reason}`,
      data: { paymentId: payment.id, orderId: payment.order.id, amount: payment.amount, reason },
      urgent: true,
      actionUrl: `/orders/${payment.order.id}/payment`,
    });
  }

  async notifySellerVerificationUpdate(sellerId: number, isVerified: boolean) {
    await this.sendToUser(sellerId, {
      type: 'verification',
      title: isVerified ? 'Seller Account Verified' : 'Seller Verification Revoked',
      message: isVerified
        ? 'Your seller account has been verified. All features unlocked.'
        : 'Your seller verification was revoked. Contact support.',
      data: { isVerified },
      urgent: true,
      actionUrl: '/seller/profile',
    });
  }

  async notifyPayoutProcessed(sellerId: number, payoutData: any) {
    await this.sendToUser(sellerId, {
      type: 'payout',
      title: 'Payout Processed',
      message: `Payout of $${payoutData.amount} processed via ${payoutData.method}`,
      data: { amount: payoutData.amount, method: payoutData.method, reference: payoutData.reference },
      actionUrl: '/seller/financial/payouts',
    });
  }

  async notifyLowStock(sellerId: number, products: any[]) {
    const names = products.map((p) => p.name).join(', ');
    await this.sendToUser(sellerId, {
      type: 'product',
      title: 'Low Stock Alert',
      message: `${products.length} product(s) low on stock: ${names}`,
      data: { products: products.map((p) => ({ id: p.id, name: p.name, stock: p.stock })) },
      urgent: true,
      actionUrl: '/seller/products',
    });
  }

  async notifyProductOutOfStock(sellerId: number, product: any) {
    await this.sendToUser(sellerId, {
      type: 'product',
      title: 'Product Out of Stock',
      message: `"${product.name}" is out of stock and has been deactivated.`,
      data: { productId: product.id, productName: product.name },
      urgent: true,
      actionUrl: `/seller/products/${product.id}`,
    });
  }

  async notifySystemMaintenance(data: {
    startTime: Date;
    endTime: Date;
    description: string;
  }) {
    return this.sendBroadcast({
      type: 'system',
      title: 'Scheduled Maintenance',
      message: `Maintenance from ${data.startTime} to ${data.endTime}. ${data.description}`,
      data: { startTime: data.startTime, endTime: data.endTime, description: data.description },
      urgent: true,
    });
  }

  async sendTestNotification(userId: number) {
    return this.sendToUser(userId, {
      type: 'system',
      title: 'Test Notification',
      message: 'Notification system is working correctly.',
      data: { test: true, timestamp: new Date().toISOString() },
    });
  }

  /** SSE health — returns connected client count */
  healthCheck(): { status: string; connectedUsers: number; timestamp: string } {
    return {
      status: 'healthy',
      connectedUsers: this.sseService.getConnectionCount(),
      timestamp: new Date().toISOString(),
    };
  }
}
