import { BaseRepository } from './base.repository';
import type { PaginationParams, PaginatedResult } from './user.repository';
import type { Prisma } from '@prisma/client';

export interface CreateContentData {
  projectId: string;
  type?: 'blog' | 'landing' | 'product' | 'schema' | 'social' | 'meta';
  title: string;
  slug: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  targetKeyword?: string;
  createdBy: string;
}

export interface UpdateContentData {
  title?: string;
  slug?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  targetKeyword?: string;
  seoScore?: Record<string, unknown>;
  overallScore?: number;
  updatedBy?: string;
}

export interface CreateVersionData {
  contentId: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  changeNote?: string;
  createdBy: string;
}

export interface ContentQueryParams extends PaginationParams {
  type?: string;
  status?: string;
}

export class ContentRepository extends BaseRepository {
  findById(id: string) {
    return this.prisma.content.findFirst({
      where: { id, ...this.softDeleteFilter() },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
        updatedByUser: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { versions: true },
        },
      },
    });
  }

  async findByProjectId(projectId: string, params: ContentQueryParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'updatedAt';
    const order = params.order ?? 'desc';

    const where: Prisma.ContentWhereInput = {
      projectId,
      ...this.softDeleteFilter(),
    };

    if (params.type) {
      where.type = params.type as Prisma.EnumContentTypeFilter['equals'];
    }

    if (params.status) {
      where.status = params.status as Prisma.EnumContentStatusFilter['equals'];
    }

    const [data, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { versions: true },
          },
        },
      }),
      this.prisma.content.count({ where }),
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

  create(data: CreateContentData) {
    return this.prisma.content.create({
      data: {
        projectId: data.projectId,
        type: data.type ?? 'blog',
        title: data.title,
        slug: data.slug,
        content: data.content,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        targetKeyword: data.targetKeyword,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
    });
  }

  update(id: string, data: UpdateContentData) {
    return this.prisma.content.update({
      where: { id },
      data: {
        ...data,
        seoScore: data.seoScore as Prisma.InputJsonValue ?? undefined,
        updatedAt: this.now(),
      },
    });
  }

  softDelete(id: string) {
    return this.prisma.content.update({
      where: { id },
      data: { status: 'archived', deletedAt: this.now(), updatedAt: this.now() },
    });
  }

  publish(id: string) {
    return this.prisma.content.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: this.now(),
        updatedAt: this.now(),
      },
    });
  }

  archive(id: string) {
    return this.prisma.content.update({
      where: { id },
      data: { status: 'archived', updatedAt: this.now() },
    });
  }

  async createVersion(data: CreateVersionData) {
    const lastVersion = await this.prisma.contentVersion.findFirst({
      where: { contentId: data.contentId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const nextVersion = (lastVersion?.version ?? 0) + 1;

    return this.prisma.contentVersion.create({
      data: {
        contentId: data.contentId,
        version: nextVersion,
        content: data.content,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        changeNote: data.changeNote,
        createdBy: data.createdBy,
      },
    });
  }

  getVersions(contentId: string) {
    return this.prisma.contentVersion.findMany({
      where: { contentId },
      orderBy: { version: 'desc' },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  getVersion(contentId: string, version: number) {
    return this.prisma.contentVersion.findUnique({
      where: {
        contentId_version: { contentId, version },
      },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }
}
