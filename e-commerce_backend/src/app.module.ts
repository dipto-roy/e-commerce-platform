/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { SellerModule } from './seller/seller.module';
import { CustomerModule } from './customer/customer.module';
import { FileUploadModule } from './seller/Files/file-upload.module';
import { ProductModule } from './product/product.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MaillerModule } from './mailler/mailler.module';
import { OrderModule } from './order/order.module';
import { FinancialModule } from './financial/financial.module';
import { NotificationModule } from './notification/notification.module';
import { AppCacheModule } from './cache/cache.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { CartModule } from './cart/cart.module';
import { PaymentModule } from './payment/payment.module';
import { MaillerService } from './mailler/mailler.service';
import { MaillerController } from './mailler/mailler.controller';
import { Product } from './product/entities/product.entity';
import { ProductImage } from './product/entities/image.entity';
import { User } from './users/entities/unified-user.entity';
import { Seller } from './seller/entities/seller.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { LoginLog } from './auth/entities/login-log.entity';
import { OtpToken } from './auth/entities/otp-token.entity';
import { OAuthAccount } from './auth/entities/oauth-account.entity';
import { Order } from './order/entities/order.entity';
import { OrderItem } from './order/entities/order-item.entity';
import { Payment } from './order/entities/payment.entity';
import { FinancialRecord } from './order/entities/financial-record.entity';
import { Cart } from './cart/entities/cart.entity';
import { Notification } from './notification/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'e_commerce'),
        entities: [
          User,
          Seller,
          Product,
          ProductImage,
          RefreshToken,
          LoginLog,
          OtpToken,
          OAuthAccount,
          Order,
          OrderItem,
          Payment,
          FinancialRecord,
          Cart,
          Notification,
        ],
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
        logging: config.get<string>('DB_LOGGING') !== 'false',
      }),
    }),
    AdminModule,
    SellerModule,
    CustomerModule,
    FileUploadModule,
    ProductModule,
    UsersModule,
    AuthModule,
    MaillerModule,
    OrderModule,
    FinancialModule,
    NotificationModule,
    AppCacheModule,
    IdempotencyModule,
    CartModule,
    PaymentModule,
  ],
  controllers: [MaillerController],
  providers: [MaillerService],
})
export class AppModule {}
