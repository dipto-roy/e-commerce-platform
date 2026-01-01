import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import { Logger as NestLogger } from '@nestjs/common';
import { dbQueryLogger } from './database-logger';

export class CustomTypeOrmLogger implements TypeOrmLogger {
  private logger = new NestLogger('TypeORM');
  private queryStartTimes = new Map<string, number>();

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    // TypeORM's logQuery is called AFTER query execution, not before
    // So we can't measure time here accurately
    // We'll rely on logQuerySlow for slow queries
    this.logger.debug(
      `Query executed: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`,
    );
    
    // Estimate as fast query if not caught by logQuerySlow
    dbQueryLogger.logQuery(query, parameters || [], 10);
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const errorMessage = error instanceof Error ? error.message : error;
    dbQueryLogger.logQueryError(errorMessage, query, parameters || []);
    this.logger.error(`Query failed: ${query}\nError: ${errorMessage}`);
  }

  /**
   * Logs query that is slow (execution time > threshold).
   */
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    dbQueryLogger.logQuery(query, parameters || [], time);
    this.logger.warn(`Slow query detected (${time}ms): ${query.substring(0, 100)}`);
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.logger.log(`Schema: ${message}`);
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner) {
    this.logger.log(`Migration: ${message}`);
  }

  /**
   * Perform logging using given logger, or by default to the console.
   */
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
        this.logger.log(message);
        break;
      case 'info':
        this.logger.log(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }
}
