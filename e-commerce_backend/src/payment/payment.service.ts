import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../order/entities/payment.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { StripeService } from './services/stripe.service';
import { InvoiceService } from './services/invoice.service';
import { MaillerService } from '../mailler/mailler.service';
import { PaymentStatus } from '../order/entities/order.enums';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(WebhookEvent)
    private webhookEventRepository: Repository<WebhookEvent>,
    private stripeService: StripeService,
    private invoiceService: InvoiceService,
    private mailService: MaillerService,
  ) {}

  /**
   * Confirm Stripe payment after webhook
   */
  async confirmStripePayment(orderId: number, paymentIntent: any) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['payment', 'buyer', 'orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Update payment record
    const payment = order.payment;
    if (payment) {
      payment.stripePaymentIntentId = paymentIntent.id;
      payment.stripeChargeId = paymentIntent.latest_charge;
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      payment.markAsProcessed();
      await this.paymentRepository.save(payment);
    }

    // Update order status
    order.paymentStatus = PaymentStatus.COMPLETED;
    await this.orderRepository.save(order);

    // Generate invoice
    const invoiceFileName = await this.invoiceService.generateInvoice(order);
    const invoiceNumber = this.invoiceService.generateInvoiceNumber(orderId);

    order.invoiceUrl = invoiceFileName;
    order.invoiceNumber = invoiceNumber;
    order.invoiceGeneratedAt = new Date();
    await this.orderRepository.save(order);

    // Log webhook event as processed in database
    await this.logWebhookEvent(
      paymentIntent.id,
      'payment_intent.succeeded',
      paymentIntent.id,
      'processed',
      paymentIntent,
    );

    // Send confirmation emails
    await this.sendOrderConfirmationEmails(order);

    this.logger.log(
      `Order ${orderId} payment confirmed and invoice generated: ${invoiceNumber}`,
    );

    return order;
  }

  /**
   * Mark payment as failed
   */
  async markPaymentFailed(orderId: number, reason: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['payment', 'buyer'],
    });

    if (!order) return;

    if (order.payment) {
      order.payment.status = PaymentStatus.FAILED;
      order.payment.markAsFailed(reason);
      await this.paymentRepository.save(order.payment);
    }

    order.paymentStatus = PaymentStatus.FAILED;
    await this.orderRepository.save(order);

    // Send failure notification
    await this.mailService.sendMail(
      order.buyer.email,
      'Payment Failed',
      `Your payment for order #${orderId} has failed. Reason: ${reason}`,
    );
  }

  /**
   * Mark payment as canceled
   */
  async markPaymentCanceled(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['payment'],
    });

    if (!order) return;

    if (order.payment) {
      order.payment.status = PaymentStatus.CANCELLED;
      await this.paymentRepository.save(order.payment);
    }

    order.paymentStatus = PaymentStatus.CANCELLED;
    await this.orderRepository.save(order);
  }

  /**
   * Mark payment as refunded
   */
  async markPaymentRefunded(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['payment'],
    });

    if (!order) return;

    if (order.payment) {
      order.payment.status = PaymentStatus.REFUNDED;
      await this.paymentRepository.save(order.payment);
    }

    order.paymentStatus = PaymentStatus.REFUNDED;
    await this.orderRepository.save(order);
  }

  /**
   * Check if webhook has been processed (idempotency) - Database-backed
   */
  async isWebhookProcessed(paymentIntentId: string): Promise<boolean> {
    // Check webhook events table for processed events
    const webhookEvent = await this.webhookEventRepository.findOne({
      where: { paymentIntentId: paymentIntentId, status: 'processed' },
    });

    if (webhookEvent) {
      this.logger.log(`Webhook for PaymentIntent ${paymentIntentId} already processed at ${webhookEvent.processedAt}`);
      return true;
    }

    // Fallback: Check payment status in database
    const payment = await this.paymentRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    return payment?.status === PaymentStatus.COMPLETED;
  }

  /**
   * Log webhook event for idempotency and audit trail
   */
  async logWebhookEvent(
    eventId: string,
    eventType: string,
    paymentIntentId: string,
    status: string,
    payload: any,
  ): Promise<WebhookEvent> {
    try {
      // Check if event already exists
      const existingEvent = await this.webhookEventRepository.findOne({
        where: { eventId },
      });

      if (existingEvent) {
        this.logger.log(`Webhook event ${eventId} already logged`);
        return existingEvent;
      }

      // Create new webhook event record
      const webhookEvent = this.webhookEventRepository.create({
        eventId,
        eventType,
        paymentIntentId,
        status,
        payload,
        processedAt: new Date(),
      });

      return await this.webhookEventRepository.save(webhookEvent);
    } catch (error) {
      this.logger.error(`Failed to log webhook event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get payment status for an order
   */
  async getPaymentStatus(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['payment'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      paidAt: order.payment?.paidAt,
      invoiceNumber: order.invoiceNumber,
      invoiceUrl: order.invoiceUrl,
    };
  }

  /**
   * Get order with invoice
   */
  async getOrderWithInvoice(orderId: number) {
    return await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['buyer', 'orderItems', 'orderItems.product'],
    });
  }

  /**
   * Find order by Stripe charge ID
   */
  async findOrderByChargeId(chargeId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { stripeChargeId: chargeId },
      relations: ['order'],
    });

    return payment?.order;
  }

  /**
   * Process refund
   */
  async processRefund(orderId: number, amount?: number, reason?: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['payment'],
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    if (!order.payment?.canBeRefunded()) {
      throw new Error('Payment cannot be refunded');
    }

    const chargeId = order.payment.stripeChargeId;
    if (!chargeId) {
      throw new Error('No Stripe charge found for this order');
    }

    // Create refund in Stripe
    const refund = await this.stripeService.createRefund(
      chargeId,
      amount,
      reason as any,
    );

    // Update payment status
    await this.markPaymentRefunded(orderId);

    this.logger.log(`Refund created for order ${orderId}: ${refund.id}`);

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    };
  }

  /**
   * Send order confirmation emails
   */
  private async sendOrderConfirmationEmails(order: Order) {
    try {
      const invoicePath = this.invoiceService.getInvoicePath(order.invoiceUrl);

      // Email to customer
      const customerEmailHtml = `
        <h2>Order Confirmation</h2>
        <p>Dear ${order.buyer.username},</p>
        <p>Thank you for your order! Your payment has been confirmed.</p>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li>Order Number: #${order.id}</li>
          <li>Invoice Number: ${order.invoiceNumber}</li>
          <li>Total Amount: $${Number(order.totalAmount).toFixed(2)}</li>
          <li>Payment Method: ${order.paymentMethod.toUpperCase()}</li>
        </ul>
        <p>Your invoice is attached to this email.</p>
        <p>Best regards,<br/>E-Commerce Team</p>
      `;

      await this.mailService.sendMailWithAttachment(
        order.buyer.email,
        'Order Confirmation & Invoice',
        customerEmailHtml,
        invoicePath,
        `${order.invoiceNumber}.pdf`,
      );

      // Email to admin
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecommerce.com';
      const adminEmailHtml = `
        <h2>New Order Received</h2>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li>Order ID: #${order.id}</li>
          <li>Customer: ${order.buyer.username} (${order.buyer.email})</li>
          <li>Total Amount: $${Number(order.totalAmount).toFixed(2)}</li>
          <li>Payment Method: ${order.paymentMethod.toUpperCase()}</li>
          <li>Payment Status: ${order.paymentStatus}</li>
        </ul>
      `;

      await this.mailService.sendMail(
        adminEmail,
        `New Order #${order.id}`,
        adminEmailHtml,
      );

      this.logger.log(`Confirmation emails sent for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send emails: ${error.message}`);
    }
  }

  /**
   * Get all payments with pagination and filters (Admin only)
   */
  async findAllPaginated(filters: {
    page: number;
    limit: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  }) {
    const skip = (filters.page - 1) * filters.limit;

    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'orderEntity')
      .leftJoinAndSelect('orderEntity.buyer', 'buyer');

    // Filter by status
    if (filters.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      query.andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
    }

    // Search by order number or buyer email
    if (filters.search) {
      query.andWhere(
        '(orderEntity.orderNumber ILIKE :search OR buyer.email ILIKE :search OR buyer.username ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Execute query with pagination
    const [payments, total] = await query
      .skip(skip)
      .take(filters.limit)
      .orderBy('payment.createdAt', 'DESC')
      .getManyAndCount();

    return {
      payments,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit),
    };
  }
}
