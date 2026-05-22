import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationTestController } from './notification-test.controller';
import { NotificationSseService } from './notification-sse.service';
import { User } from '../users/entities/unified-user.entity';
import { Order } from '../order/entities/order.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Notification])],
  controllers: [NotificationController, NotificationTestController],
  providers: [NotificationService, NotificationSseService],
  exports: [NotificationService, NotificationSseService],
})
export class NotificationModule {}
