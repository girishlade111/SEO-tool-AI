import { BaseRepository } from './base.repository';
import type { PaginationParams, PaginatedResult } from './user.repository';
import type { Prisma } from '@prisma/client';

export interface AdminListUsersParams extends PaginationParams {
  status?: string;
  role?: string;
  search?: string;
}

export interface AdminUpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended' | 'inactive';
  avatarUrl?: string;
}

export interface AuditLogQueryParams extends PaginationParams {
  userId?: string;
  entity?: string;
  action?: string;
}

export interface CreateFeatureFlagData {
  name: string;
  description: string;
  enabled?: boolean;
  rules?: Record<string, unknown>;
}

export interface UpdateFeatureFlagData {
  description?: string;
  enabled?: boolean;
  rules?: Record<string, unknown>;
}

export class AdminRepository extends BaseRepository {
  async listUsers(params: AdminListUsersParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'createdAt';
    const order = params.order ?? 'desc';

    const where: Prisma.UserWhereInput = {
      ...this.softDeleteFilter(),
    };

    if (params.status) {
      where.status = params.status as 'active' | 'suspended' | 'inactive';
    }

    if (params.role) {
      where.role = params.role as 'user' | 'admin';
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          status: true,
          emailVerifiedAt: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          _count: {
            select: {
              projects: true,
              subscriptions: true,
              conversations: true,
            },
          },
          subscriptions: {
            select: {
              id: true,
              plan: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
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

  getUserById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, ...this.softDeleteFilter() },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        projects: {
          select: {
            id: true,
            name: true,
            domain: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        subscriptions: true,
        _count: {
          select: {
            projects: true,
            conversations: true,
            notifications: true,
            apiKeys: true,
          },
        },
      },
    });
  }

  updateUser(id: string, data: AdminUpdateUserData) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: this.now(),
      },
    });
  }

  async getAuditLogs(params: AuditLogQueryParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'createdAt';
    const order = params.order ?? 'desc';

    const where: Prisma.AuditLogWhereInput = {};

    if (params.userId) {
      where.userId = params.userId;
    }

    if (params.entity) {
      where.entity = params.entity;
    }

    if (params.action) {
      where.action = params.action;
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
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

  async getStats() {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalProjects,
      activeProjects,
      totalAnalyses,
      completedAnalyses,
      activeSubscriptions,
      totalRevenue,
      totalKeywords,
      totalContent,
    ] = await Promise.all([
      this.prisma.user.count({ where: this.softDeleteFilter() }),
      this.prisma.user.count({ where: { status: 'active', ...this.softDeleteFilter() } }),
      this.prisma.user.count({ where: { status: 'suspended', ...this.softDeleteFilter() } }),
      this.prisma.project.count({ where: this.softDeleteFilter() }),
      this.prisma.project.count({ where: { status: 'active', ...this.softDeleteFilter() } }),
      this.prisma.analysis.count(),
      this.prisma.analysis.count({ where: { status: 'completed' } }),
      this.prisma.subscription.count({ where: { status: 'active' } }),
      this.prisma.invoice.aggregate({ _sum: { amountPaid: true }, where: { status: 'paid' } }),
      this.prisma.keyword.count({ where: this.softDeleteFilter() }),
      this.prisma.content.count({ where: this.softDeleteFilter() }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
      },
      analyses: {
        total: totalAnalyses,
        completed: completedAnalyses,
      },
      subscriptions: {
        active: activeSubscriptions,
      },
      revenue: {
        total: totalRevenue._sum.amountPaid ?? 0,
      },
      keywords: {
        total: totalKeywords,
      },
      content: {
        total: totalContent,
      },
    };
  }

  getFeatureFlags() {
    return this.prisma.featureFlag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  getFeatureFlagByName(name: string) {
    return this.prisma.featureFlag.findUnique({
      where: { name },
    });
  }

  createFeatureFlag(data: CreateFeatureFlagData) {
    return this.prisma.featureFlag.create({
      data: {
        name: data.name,
        description: data.description,
        enabled: data.enabled ?? false,
        rules: data.rules as Prisma.InputJsonValue ?? undefined,
      },
    });
  }

  updateFeatureFlag(id: string, data: UpdateFeatureFlagData) {
    return this.prisma.featureFlag.update({
      where: { id },
      data: {
        ...data,
        rules: data.rules as Prisma.InputJsonValue ?? undefined,
        updatedAt: this.now(),
      },
    });
  }
}
