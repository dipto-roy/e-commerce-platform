import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Res,
  Headers,
  HttpStatus,
  Logger,
  UseGuards,
  RawBodyRequest,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { StripeService } from './services/stripe.service';
import { InvoiceService } from './services/invoice.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/entities/role.enum';
import * as fs from 'fs';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeService: StripeService,
    private readonly invoiceService: InvoiceService,
  ) {}

  /**
   * Get all payments with pagination and filters (Admin only)
   * GET /api/v1/payments
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async getAllPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    try {
      const result = await this.paymentService.findAllPaginated({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        search,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch payments: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to fetch payments');
    }
  }

  /**
   * Stripe Webhook Handler
   * POST /api/v1/payments/stripe/webhook
   */
  @Post('stripe/webhook')
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Res() response: Response,
  ) {
    try {
      if (!signature) {
        this.logger.warn('Webhook received without signature');
        return response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Missing stripe-signature header',
        });
      }

      // Get raw body for signature verification
      const rawBody = request.rawBody;
      if (!rawBody) {
        this.logger.error('Raw body not available for webhook verification');
        return response.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'Raw body not available',
        });
      }

      // Construct and verify webhook event
      const event = this.stripeService.constructWebhookEvent(
        rawBody,
        signature,
      );

      if (!event) {
        this.logger.error('Webhook signature verification failed');
        return response.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid signature',
        });
      }

      this.logger.log(`Webhook received: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentCanceled(event.data.object);
          break;

        case 'charge.refunded':
          await this.handleRefund(event.data.object);
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }

      // Acknowledge receipt
      return response.status(HttpStatus.OK).json({ received: true });
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`, error.stack);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Webhook processing failed',
      });
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(paymentIntent: any) {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      if (!orderId) {
        this.logger.warn(
          `PaymentIntent ${paymentIntent.id} has no orderId in metadata`,
        );
        return;
      }

      // Check idempotency to prevent duplicate processing
      const alreadyProcessed = await this.paymentService.isWebhookProcessed(
        paymentIntent.id,
      );
      if (alreadyProcessed) {
        this.logger.log(
          `PaymentIntent ${paymentIntent.id} already processed, skipping`,
        );
        return;
      }

      // Update payment and order status
      await this.paymentService.confirmStripePayment(
        parseInt(orderId),
        paymentIntent,
      );

      this.logger.log(
        `Payment succeeded for order ${orderId}, PaymentIntent: ${paymentIntent.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle payment success: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(paymentIntent: any) {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      if (!orderId) {
        this.logger.warn(
          `Failed PaymentIntent ${paymentIntent.id} has no orderId`,
        );
        return;
      }

      await this.paymentService.markPaymentFailed(
        parseInt(orderId),
        paymentIntent.last_payment_error?.message || 'Payment failed',
      );

      this.logger.log(`Payment failed for order ${orderId}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle payment failure: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle canceled payment
   */
  private async handlePaymentCanceled(paymentIntent: any) {
    try {
      const orderId = paymentIntent.metadata?.orderId;
      if (!orderId) return;

      await this.paymentService.markPaymentCanceled(parseInt(orderId));
      this.logger.log(`Payment canceled for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to handle payment cancellation: ${error.message}`);
    }
  }

  /**
   * Handle refund
   */
  private async handleRefund(charge: any) {
    try {
      // Find order by charge ID
      const order = await this.paymentService.findOrderByChargeId(charge.id);
      if (order) {
        await this.paymentService.markPaymentRefunded(order.id);
        this.logger.log(`Refund processed for order ${order.id}`);
      }
    } catch (error) {
      this.logger.error(`Failed to handle refund: ${error.message}`);
    }
  }

  /**
   * Get payment status
   * GET /api/v1/payments/:orderId/status
   */
  @Get(':orderId/status')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Param('orderId') orderId: number) {
    try {
      const status = await this.paymentService.getPaymentStatus(orderId);
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      throw new NotFoundException(`Payment status not found for order ${orderId}`);
    }
  }

  /**
   * Download invoice
   * GET /api/v1/payments/:orderId/invoice
   */
  @Get(':orderId/invoice')
  @UseGuards(JwtAuthGuard)
  async downloadInvoice(
    @Param('orderId') orderId: number,
    @Res() response: Response,
  ) {
    try {
      const order = await this.paymentService.getOrderWithInvoice(orderId);

      if (!order || !order.invoiceUrl) {
        throw new NotFoundException('Invoice not found');
      }

      const invoicePath = this.invoiceService.getInvoicePath(order.invoiceUrl);

      if (!fs.existsSync(invoicePath)) {
        throw new NotFoundException('Invoice file not found');
      }

      // Stream the PDF file
      response.setHeader('Content-Type', 'application/pdf');
      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${order.invoiceNumber}.pdf"`,
      );

      const fileStream = fs.createReadStream(invoicePath);
      fileStream.pipe(response);
    } catch (error) {
      this.logger.error(`Failed to download invoice: ${error.message}`);
      throw error;
    }
  }

  /**
   * Request refund
   * POST /api/v1/payments/:orderId/refund
   */
  @Post(':orderId/refund')
  @UseGuards(JwtAuthGuard)
  async requestRefund(
    @Param('orderId') orderId: number,
    @Body() body: { amount?: number; reason?: string },
  ) {
    try {
      const result = await this.paymentService.processRefund(
        orderId,
        body.amount,
        body.reason,
      );

      return {
        success: true,
        message: 'Refund processed successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Refund failed: ${error.message}`);
      throw new BadRequestException(error.message);
    }
  }
}
