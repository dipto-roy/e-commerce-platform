import { Module } from '@nestjs/common';
import { AppCacheModule } from '../cache/cache.module';
import { IdempotencyInterceptor } from './idempotency.interceptor';

@Module({
  imports: [AppCacheModule],
  providers: [IdempotencyInterceptor],
  exports: [IdempotencyInterceptor],
})
export class IdempotencyModule {}
