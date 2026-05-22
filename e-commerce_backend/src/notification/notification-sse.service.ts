import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class NotificationSseService implements OnModuleDestroy {
  private readonly logger = new Logger(NotificationSseService.name);
  private readonly connections = new Map<number, Subject<MessageEvent>>();

  /**
   * Creates an SSE Observable for the given userId.
   * Replaces any existing connection for that user.
   */
  subscribe(userId: number): Observable<MessageEvent> {
    this.disconnect(userId);

    const subject = new Subject<MessageEvent>();
    this.connections.set(userId, subject);
    this.logger.log(
      `SSE connected: user ${userId}. Active: ${this.connections.size}`,
    );

    return new Observable<MessageEvent>((observer) => {
      const sub = subject.subscribe(observer);
      return () => {
        sub.unsubscribe();
        this.connections.delete(userId);
        this.logger.log(
          `SSE disconnected: user ${userId}. Active: ${this.connections.size}`,
        );
      };
    });
  }

  /** Push a notification event to a single user. Returns true if delivered. */
  emit(userId: number, data: Record<string, unknown>): boolean {
    const subject = this.connections.get(userId);
    if (subject && !subject.closed) {
      subject.next({ data });
      return true;
    }
    return false;
  }

  /** Push to a specific set of users. Returns delivery count. */
  emitToUsers(userIds: number[], data: Record<string, unknown>): number {
    let count = 0;
    for (const id of userIds) {
      if (this.emit(id, data)) count++;
    }
    return count;
  }

  /** Broadcast to every connected client. Returns delivery count. */
  emitToAll(data: Record<string, unknown>): number {
    let count = 0;
    this.connections.forEach((subject) => {
      if (!subject.closed) {
        subject.next({ data });
        count++;
      }
    });
    return count;
  }

  disconnect(userId: number): void {
    const subject = this.connections.get(userId);
    if (subject) {
      subject.complete();
      this.connections.delete(userId);
    }
  }

  isConnected(userId: number): boolean {
    const subject = this.connections.get(userId);
    return !!subject && !subject.closed;
  }

  getConnectedUserIds(): number[] {
    return Array.from(this.connections.entries())
      .filter(([, s]) => !s.closed)
      .map(([id]) => id);
  }

  getConnectionCount(): number {
    return this.getConnectedUserIds().length;
  }

  onModuleDestroy(): void {
    this.connections.forEach((s) => s.complete());
    this.connections.clear();
  }
}
