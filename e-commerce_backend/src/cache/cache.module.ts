import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { AppCacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);
        const password = config.get<string>('REDIS_PASSWORD') || undefined;
        const tls = config.get<string>('REDIS_TLS') === 'true';

        const store = await redisStore({
          socket: {
            host,
            port,
            tls,
            reconnectStrategy: (retries: number) => Math.min(retries * 200, 5000),
          },
          ...(password && { password }),
          ttl: 120, // default TTL 2 min
        });

        return { store };
      },
    }),
  ],
  providers: [AppCacheService],
  exports: [AppCacheService, CacheModule],
})
export class AppCacheModule {}
