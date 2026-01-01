import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [MonitoringController],
  providers: [],
  exports: [],
})
export class MonitoringModule {}
