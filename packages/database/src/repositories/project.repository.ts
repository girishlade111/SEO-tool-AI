import { BaseRepository } from './base.repository';
import type { PaginationParams, PaginatedResult } from './user.repository';
import type { Prisma } from '@prisma/client';

export interface CreateProjectData {
  name: string;
  domain: string;
  description?: string;
  settings?: Record<string, unknown>;
  userId: string;
}

export interface UpdateProjectData {
  name?: string;
  domain?: string;
  description?: string;
  settings?: Record<string, unknown>;
  status?: 'active' | 'archived' | 'deleted';
}

export class ProjectRepository extends BaseRepository {
  findById(id: string) {
    return this.prisma.project.findFirst({
      where: { id, ...this.softDeleteFilter() },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: {
            pages: true,
            analyses: true,
            keywords: true,
            contents: true,
          },
        },
      },
    });
  }

  findByDomain(domain: string) {
    return this.prisma.project.findFirst({
      where: { domain, ...this.softDeleteFilter() },
    });
  }

  async findByUserId(userId: string, params: PaginationParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'updatedAt';
    const order = params.order ?? 'desc';

    const where: Prisma.ProjectWhereInput = {
      userId,
      ...this.softDeleteFilter(),
    };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: {
              pages: true,
              analyses: true,
              keywords: true,
              members: true,
            },
          },
        },
      }),
      this.prisma.project.count({ where }),
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

  create(data: CreateProjectData) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        domain: data.domain,
        description: data.description,
        settings: data.settings as Prisma.InputJsonValue ?? undefined,
        userId: data.userId,
      },
    });
  }

  update(id: string, data: UpdateProjectData) {
    return this.prisma.project.update({
      where: { id },
      data: {
        ...data,
        settings: data.settings as Prisma.InputJsonValue ?? undefined,
        updatedAt: this.now(),
      },
    });
  }

  softDelete(id: string) {
    return this.prisma.project.update({
      where: { id },
      data: { status: 'deleted', deletedAt: this.now(), updatedAt: this.now() },
    });
  }

  archive(id: string) {
    return this.prisma.project.update({
      where: { id },
      data: { status: 'archived', updatedAt: this.now() },
    });
  }

  restore(id: string) {
    return this.prisma.project.update({
      where: { id },
      data: { status: 'active', deletedAt: null, updatedAt: this.now() },
    });
  }

  countByUserId(userId: string) {
    return this.prisma.project.count({
      where: { userId, ...this.softDeleteFilter() },
    });
  }

  addMember(projectId: string, userId: string, role: string) {
    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: role as 'owner' | 'editor' | 'viewer',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });
  }

  updateMember(projectId: string, memberId: string, role: string) {
    return this.prisma.projectMember.update({
      where: { id: memberId, projectId },
      data: { role: role as 'owner' | 'editor' | 'viewer', updatedAt: this.now() },
    });
  }

  removeMember(projectId: string, memberId: string) {
    return this.prisma.projectMember.delete({
      where: { id: memberId, projectId },
    });
  }

  getMembers(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
