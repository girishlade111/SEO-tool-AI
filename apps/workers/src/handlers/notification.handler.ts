import { NotificationRepository } from '@lade/database';
import { NotificationService } from '@lade/services';
import { logger } from '@lade/config';
import type { Job } from '../types';

const notifRepo = new NotificationRepository();
const notifService = new NotificationService(notifRepo);

export async function handleNotificationSend(job: Job<{ userId: string; type: string; title: string; message: string; data?: Record<string, unknown> }>): Promise<void> {
  logger.info('Sending notification', { userId: job.data.userId, type: job.data.type });

  await notifService.send(
    job.data.userId,
    job.data.type as any,
    job.data.title,
    job.data.message,
    job.data.data
  );

  logger.info('Notification sent', { userId: job.data.userId, type: job.data.type });
}

export async function handleBulkNotificationSend(job: Job<{ notifications: Array<{ userId: string; type: string; title: string; message: string }> }>): Promise<void> {
  logger.info('Sending bulk notifications', { count: job.data.notifications.length });

  await notifService.sendBulk(
    job.data.notifications.map((n) => ({
      userId: n.userId,
      type: n.type as any,
      title: n.title,
      message: n.message,
    }))
  );

  logger.info('Bulk notifications sent', { count: job.data.notifications.length });
}
