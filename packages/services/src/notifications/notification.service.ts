import { NotificationRepository } from '@lade/database';
import type { Notification, PaginationParams, NotificationType } from '@lade/shared';
import { logger } from '@lade/config';

export class NotificationService {
  constructor(private readonly notifRepo: NotificationRepository) {}

  async list(userId: string, params: PaginationParams & { unreadOnly?: boolean }) {
    return this.notifRepo.findByUserId(userId, params);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.getUnreadCount(userId);
  }

  async send(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<Notification> {
    return this.notifRepo.create({ userId, type, title, message, data });
  }

  async sendBulk(
    notifications: Array<{
      userId: string;
      type: NotificationType;
      title: string;
      message: string;
      data?: Record<string, unknown>;
    }>
  ) {
    return this.notifRepo.bulkCreate(notifications);
  }

  async markAsRead(id: string): Promise<void> {
    await this.notifRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notifRepo.markAllAsRead(userId);
  }
}
