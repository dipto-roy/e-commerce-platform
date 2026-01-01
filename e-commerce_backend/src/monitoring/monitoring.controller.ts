import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { dbQueryLogger } from './database-logger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Get('db-metrics')
  @ApiOperation({ summary: 'Get database query metrics' })
  getDbMetrics() {
    return {
      timestamp: new Date(),
      metrics: dbQueryLogger.getMetrics(),
    };
  }

  @Get('db-metrics/reset')
  @ApiOperation({ summary: 'Reset database query metrics' })
  resetDbMetrics() {
    dbQueryLogger.resetMetrics();
    return {
      message: 'Metrics reset successfully',
      timestamp: new Date(),
    };
  }

  @Get('db-metrics/report')
  @ApiOperation({ summary: 'Print database query report to console' })
  printDbReport() {
    dbQueryLogger.printReport();
    return {
      message: 'Report printed to console',
      timestamp: new Date(),
      metrics: dbQueryLogger.getMetrics(),
    };
  }

  @Get('db-connection')
  @ApiOperation({ summary: 'Get database connection pool status' })
  async getConnectionStatus() {
    const driver = this.dataSource.driver as any;
    
    return {
      isConnected: this.dataSource.isInitialized,
      databaseType: this.dataSource.options.type,
      database: (this.dataSource.options as any).database,
      host: (this.dataSource.options as any).host,
      port: (this.dataSource.options as any).port,
      // Connection pool info (if available)
      pool: driver.master?.pool
        ? {
            totalCount: driver.master.pool.totalCount || 0,
            idleCount: driver.master.pool.idleCount || 0,
            waitingCount: driver.master.pool.waitingCount || 0,
          }
        : null,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Database health check' })
  async healthCheck() {
    try {
      const startTime = Date.now();
      await this.dataSource.query('SELECT 1');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        status: 'healthy',
        database: 'connected',
        responseTime: `${responseTime}ms`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}
