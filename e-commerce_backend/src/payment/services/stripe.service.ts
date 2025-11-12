import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });

    this.logger.log('Stripe service initialized');
  }

  /**
   * Create a PaymentIntent for Stripe checkout
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
  ): Promise<Stripe.PaymentIntent> {
    try {
      // Convert amount to cents (Stripe expects smallest currency unit)
      const amountInCents = Math.round(amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(
        `PaymentIntent created: ${paymentIntent.id} for ${currency} ${amount}`,
      );
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create PaymentIntent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retrieve a PaymentIntent by ID
   */
  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Cancel a PaymentIntent
   */
  async cancelPaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.cancel(paymentIntentId);
  }

  /**
   * Create a refund for a charge
   */
  async createRefund(
    chargeId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason,
  ): Promise<Stripe.Refund> {
    const params: Stripe.RefundCreateParams = {
      charge: chargeId,
    };

    if (amount) {
      params.amount = Math.round(amount * 100); // Convert to cents
    }

    if (reason) {
      params.reason = reason;
    }

    return await this.stripe.refunds.create(params);
  }

  /**
   * Construct webhook event from raw body and signature
   */
  constructWebhookEvent(
    rawBody: Buffer,
    signature: string,
  ): Stripe.Event | null {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured');
      return null;
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
      return event;
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Get Stripe instance for advanced operations
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}
