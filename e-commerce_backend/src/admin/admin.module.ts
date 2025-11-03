import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { OrderModule } from '../order/order.module';
import { MaillerModule } from '../mailler/mailler.module';
import { User } from '../users/entities/unified-user.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Product]),
    UsersModule,
    OrderModule,
    MaillerModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
