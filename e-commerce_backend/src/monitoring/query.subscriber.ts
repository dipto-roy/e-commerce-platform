import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from 'typeorm';
import { Logger } from '@nestjs/common';
import { dbQueryLogger } from './database-logger';

@EventSubscriber()
export class QuerySubscriber implements EntitySubscriberInterface {
  private logger = new Logger('QuerySubscriber');
  private queryStartTimes = new Map<string, number>();

  /**
   * Called before query execution
   */
  beforeQuery(event: any) {
    const queryId = this.generateQueryId(event);
    this.queryStartTimes.set(queryId, Date.now());
  }

  /**
   * Called after query execution
   */
  afterQuery(event: any) {
    const queryId = this.generateQueryId(event);
    const startTime = this.queryStartTimes.get(queryId);
    
    if (startTime) {
      const executionTime = Date.now() - startTime;
      const query = event.query || 'Unknown query';
      const parameters = event.parameters || [];
      
      // Log to our metrics tracker
      dbQueryLogger.logQuery(query, parameters, executionTime);
      
      // Clean up
      this.queryStartTimes.delete(queryId);
    }
  }

  /**
   * Called before entity insertion
   */
  beforeInsert(event: InsertEvent<any>) {
    const queryId = `insert-${event.entity?.constructor.name}-${Date.now()}`;
    this.queryStartTimes.set(queryId, Date.now());
  }

  /**
   * Called after entity insertion
   */
  afterInsert(event: InsertEvent<any>) {
    const queryId = `insert-${event.entity?.constructor.name}`;
    this.trackEntityOperation('INSERT', queryId);
  }

  /**
   * Called before entity update
   */
  beforeUpdate(event: UpdateEvent<any>) {
    const queryId = `update-${event.entity?.constructor.name}-${Date.now()}`;
    this.queryStartTimes.set(queryId, Date.now());
  }

  /**
   * Called after entity update
   */
  afterUpdate(event: UpdateEvent<any>) {
    const queryId = `update-${event.entity?.constructor.name}`;
    this.trackEntityOperation('UPDATE', queryId);
  }

  /**
   * Called before entity removal
   */
  beforeRemove(event: RemoveEvent<any>) {
    const queryId = `remove-${event.entity?.constructor.name}-${Date.now()}`;
    this.queryStartTimes.set(queryId, Date.now());
  }

  /**
   * Called after entity removal
   */
  afterRemove(event: RemoveEvent<any>) {
    const queryId = `remove-${event.entity?.constructor.name}`;
    this.trackEntityOperation('DELETE', queryId);
  }

  private trackEntityOperation(operation: string, queryId: string) {
    const startTime = this.queryStartTimes.get(queryId);
    if (startTime) {
      const executionTime = Date.now() - startTime;
      dbQueryLogger.logQuery(`${operation} entity`, [], executionTime);
      this.queryStartTimes.delete(queryId);
    }
  }

  private generateQueryId(event: any): string {
    return `${Date.now()}-${Math.random()}`;
  }
}
