import { Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

export class DatabaseQueryLogger {
  private logger = new Logger('DatabaseQuery');
  private queryMetrics = {
    totalQueries: 0,
    slowQueries: 0,
    totalTime: 0,
    avgTime: 0,
    maxTime: 0,
    minTime: Infinity,
    queriesByType: {
      SELECT: 0,
      INSERT: 0,
      UPDATE: 0,
      DELETE: 0,
    },
    slowQueryDetails: [] as Array<{
      query: string;
      time: number;
      timestamp: Date;
    }>,
  };

  /**
   * Log query execution time
   */
  logQuery(query: string, parameters: any[], time: number) {
    this.queryMetrics.totalQueries++;
    this.queryMetrics.totalTime += time;

    // Update min/max time
    if (time > this.queryMetrics.maxTime) {
      this.queryMetrics.maxTime = time;
    }
    if (time < this.queryMetrics.minTime) {
      this.queryMetrics.minTime = time;
    }

    // Calculate average
    this.queryMetrics.avgTime =
      this.queryMetrics.totalTime / this.queryMetrics.totalQueries;

    // Track query types
    const queryType = query.trim().split(' ')[0].toUpperCase();
    if (this.queryMetrics.queriesByType[queryType] !== undefined) {
      this.queryMetrics.queriesByType[queryType]++;
    }

    // Log slow queries (> 100ms)
    if (time > 100) {
      this.queryMetrics.slowQueries++;
      this.queryMetrics.slowQueryDetails.push({
        query: query.substring(0, 200), // Truncate long queries
        time,
        timestamp: new Date(),
      });

      this.logger.warn(
        `🐌 SLOW QUERY (${time}ms):\n${query.substring(0, 200)}${query.length > 200 ? '...' : ''}`,
      );
    } else if (time > 50) {
      this.logger.debug(`⚠️  Query took ${time}ms: ${query.substring(0, 100)}`);
    } else {
      this.logger.debug(`✅ Query took ${time}ms: ${query.substring(0, 100)}`);
    }
  }

  /**
   * Log query errors
   */
  logQueryError(error: string, query: string, parameters: any[]) {
    this.logger.error(`❌ Query Error:\n${query}\nError: ${error}`);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.queryMetrics,
      slowQueryDetails: this.queryMetrics.slowQueryDetails.slice(-10), // Last 10 slow queries
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.queryMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
      minTime: Infinity,
      queriesByType: {
        SELECT: 0,
        INSERT: 0,
        UPDATE: 0,
        DELETE: 0,
      },
      slowQueryDetails: [],
    };
    this.logger.log('📊 Metrics reset');
  }

  /**
   * Print summary report
   */
  printReport() {
    this.logger.log('📊 ===== DATABASE QUERY REPORT =====');
    this.logger.log(`Total Queries: ${this.queryMetrics.totalQueries}`);
    this.logger.log(`Total Time: ${this.queryMetrics.totalTime.toFixed(2)}ms`);
    this.logger.log(`Average Time: ${this.queryMetrics.avgTime.toFixed(2)}ms`);
    this.logger.log(`Min Time: ${this.queryMetrics.minTime === Infinity ? 0 : this.queryMetrics.minTime}ms`);
    this.logger.log(`Max Time: ${this.queryMetrics.maxTime}ms`);
    this.logger.log(`Slow Queries (>100ms): ${this.queryMetrics.slowQueries}`);
    this.logger.log('Query Types:');
    Object.entries(this.queryMetrics.queriesByType).forEach(([type, count]) => {
      this.logger.log(`  - ${type}: ${count}`);
    });
    this.logger.log('===================================');
  }
}

// Singleton instance
export const dbQueryLogger = new DatabaseQueryLogger();
