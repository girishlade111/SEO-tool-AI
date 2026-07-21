import { BaseRepository } from './base.repository';
import type { PaginationParams, PaginatedResult } from './user.repository';
import type { Prisma, $Enums } from '@prisma/client';

export interface CreateNotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface NotificationQueryParams extends PaginationParams {
  unreadOnly?: boolean;
}

export class NotificationRepository extends BaseRepository {
  async findByUserId(userId: string, params: NotificationQueryParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'createdAt';
    const order = params.order ?? 'desc';

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(params.unreadOnly ? { read: false } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  create(data: CreateNotificationData) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as $Enums.NotificationType,
        title: data.title,
        message: data.message,
        data: data.data as Prisma.InputJsonValue ?? undefined,
      },
    });
  }

  bulkCreate(data: CreateNotificationData[]) {
    return this.prisma.notification.createMany({
      data: data.map(n => ({
        userId: n.userId,
        type: n.type as $Enums.NotificationType,
        title: n.title,
        message: n.message,
        data: n.data as Prisma.InputJsonValue ?? undefined,
      })),
    });
  }

  markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: this.now() },
    });
  }

  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: this.now() },
    });
  }

  getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  deleteOldNotifications(before: Date) {
    return this.prisma.notification.deleteMany({
      where: { createdAt: { lt: before } },
    });
  }
}
