import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationTestController } from './notification-test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/unified-user.entity';
import { Order } from '../order/entities/order.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Notification])],
  controllers: [NotificationController, NotificationTestController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
