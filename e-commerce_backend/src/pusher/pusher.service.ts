import { Injectable, Logger } from '@nestjs/common';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name);
  private pusher: Pusher;

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || '',
      key: process.env.PUSHER_KEY || '',
      secret: process.env.PUSHER_SECRET || '',
      cluster: process.env.PUSHER_CLUSTER || 'ap2',
      useTLS: true,
    });

    this.logger.log(
      `Pusher initialized for cluster: ${process.env.PUSHER_CLUSTER || 'ap2'}`,
    );
  }

  async trigger(channel: string, event: string, data: any) {
    try {
      await this.pusher.trigger(channel, event, data);
      this.logger.log(`Event triggered: ${event} on channel: ${channel}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to trigger event: ${event}`, error);
      return { success: false, error: error.message };
    }
  }

  authenticate(socketId: string, channel: string) {
    return this.pusher.authenticate(socketId, channel);
  }

  authorize(socketId: string, channel: string) {
    return this.pusher.authorizeChannel(socketId, channel);
  }
}
