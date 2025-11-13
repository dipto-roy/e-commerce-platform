import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ReportService } from './report.service';
import { UsersModule } from '../users/users.module';
import { OrderModule } from '../order/order.module';
import { MaillerModule } from '../mailler/mailler.module';
import { User } from '../users/entities/unified-user.entity';
import { Product } from '../product/entities/product.entity';
import { Order } from '../order/entities/order.entity';
import { Payment } from '../order/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product, Order, Payment]),
    UsersModule,
    OrderModule,
    MaillerModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, ReportService],
})
export class AdminModule {}
