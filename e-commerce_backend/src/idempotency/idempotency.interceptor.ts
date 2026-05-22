import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { AppCacheService } from '../cache/cache.service';

/** 24 hours — matches Stripe's idempotency window */
const IDEMPOTENCY_TTL_SECONDS = 86_400;

/** Guard against caching huge responses in Redis */
const MAX_CACHED_BODY_BYTES = 65_536; // 64 KB

interface CachedEntry {
  status: number;
  body: unknown;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(private readonly cache: AppCacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Only mutating methods need idempotency
    if (!['POST', 'PATCH', 'PUT'].includes(request.method)) {
      return next.handle();
    }

    const idempotencyKey = request.headers['idempotency-key'] as
      | string
      | undefined;
    if (!idempotencyKey?.trim()) {
      return next.handle();
    }

    const userId = (request as any).user?.id ?? 'anon';
    const cacheKey = `idempotency:${userId}:${idempotencyKey.trim()}`;

    // Check for replayed request
    let cached: CachedEntry | null = null;
    try {
      cached = await this.cache.get<CachedEntry>(cacheKey);
    } catch (err) {
      // Redis unavailable — fail open, process normally
      this.logger.warn(
        `Idempotency cache read failed: ${(err as Error).message}`,
      );
      return next.handle();
    }

    if (cached) {
      this.logger.debug(
        `Idempotency replay: key=${idempotencyKey} user=${userId}`,
      );
      response.status(cached.status);
      response.setHeader('X-Idempotency-Replayed', 'true');
      return new Observable((subscriber) => {
        subscriber.next(cached.body);
        subscriber.complete();
      });
    }

    // First request — execute and cache result
    return next.handle().pipe(
      tap((body) => {
        try {
          const serialized = JSON.stringify(body ?? null);
          if (serialized.length > MAX_CACHED_BODY_BYTES) {
            this.logger.warn(
              `Idempotency response too large to cache (${serialized.length} bytes), key=${idempotencyKey}`,
            );
            return;
          }

          const entry: CachedEntry = {
            status: response.statusCode ?? 200,
            body,
          };

          this.cache
            .set(cacheKey, entry, IDEMPOTENCY_TTL_SECONDS)
            .catch((err) => {
              this.logger.warn(
                `Idempotency cache write failed: ${(err as Error).message}`,
              );
            });
        } catch {
          // Non-serializable body — skip cache silently
        }
      }),
    );
  }
}
