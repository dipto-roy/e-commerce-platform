import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { StripeService } from './services/stripe.service';
import { InvoiceService } from './services/invoice.service';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../order/entities/payment.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { User } from '../users/entities/unified-user.entity';
import { Product } from '../product/entities/product.entity';
import { MaillerModule } from '../mailler/mailler.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Order, Payment, WebhookEvent, OrderItem, User, Product]),
    MaillerModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, StripeService, InvoiceService],
  exports: [PaymentService, StripeService, InvoiceService],
})
export class PaymentModule {}
