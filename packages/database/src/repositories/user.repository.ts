import { BaseRepository } from './base.repository';
import type { Prisma } from '@prisma/client';

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
  avatarUrl?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended' | 'inactive';
}

export interface UpdateUserData {
  name?: string;
  avatarUrl?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended' | 'inactive';
}

export interface ListUsersParams extends PaginationParams {
  status?: 'active' | 'suspended' | 'inactive';
  role?: 'user' | 'admin';
}

export class UserRepository extends BaseRepository {
  findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, ...this.softDeleteFilter() },
      include: {
        subscriptions: true,
        _count: {
          select: {
            projects: true,
            conversations: true,
            notifications: true,
          },
        },
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, ...this.softDeleteFilter() },
    });
  }

  create(data: CreateUserData) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        avatarUrl: data.avatarUrl,
        role: data.role ?? 'user',
        status: data.status ?? 'active',
      },
    });
  }

  update(id: string, data: UpdateUserData) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: this.now(),
      },
    });
  }

  updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash, updatedAt: this.now() },
    });
  }

  verifyEmail(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { emailVerifiedAt: this.now(), updatedAt: this.now() },
    });
  }

  suspend(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'suspended', updatedAt: this.now() },
    });
  }

  activate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'active', updatedAt: this.now() },
    });
  }

  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: this.now(), updatedAt: this.now() },
    });
  }

  async list(params: ListUsersParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'createdAt';
    const order = params.order ?? 'desc';

    const where: Prisma.UserWhereInput = {
      ...this.softDeleteFilter(),
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.role) {
      where.role = params.role;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: {
              projects: true,
              subscriptions: true,
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

  async count(params?: { status?: string; role?: string }) {
    const where: Prisma.UserWhereInput = {
      ...this.softDeleteFilter(),
    };

    if (params?.status) {
      where.status = params.status as 'active' | 'suspended' | 'inactive';
    }

    if (params?.role) {
      where.role = params.role as 'user' | 'admin';
    }

    return this.prisma.user.count({ where });
  }
}
