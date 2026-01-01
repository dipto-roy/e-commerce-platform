import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { dbQueryLogger } from './database-logger';

@Injectable()
export class QueryTimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('QueryTiming');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();
    const startMetrics = { ...dbQueryLogger.getMetrics() };

    return next.handle().pipe(
      tap(() => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const endMetrics = dbQueryLogger.getMetrics();
        
        const queriesExecuted = endMetrics.totalQueries - startMetrics.totalQueries;
        const queryTime = endMetrics.totalTime - startMetrics.totalTime;

        if (queriesExecuted > 0) {
          this.logger.log(
            `${method} ${url} - Response: ${responseTime}ms | DB Queries: ${queriesExecuted} (${queryTime.toFixed(2)}ms)`,
          );
        }
      }),
    );
  }
}
