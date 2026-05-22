import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/unified-user.entity';
import { Seller } from './seller/entities/seller.entity';
import { Product } from './product/entities/product.entity';
import { ProductImage } from './product/entities/image.entity';
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

// Load environment variables
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'e_commerce',
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
  migrations: ['src/migration/*.ts', 'src/migrations/*.ts'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
});
