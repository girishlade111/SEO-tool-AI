import { BaseRepository } from './base.repository';
import type { PaginationParams, PaginatedResult } from './user.repository';
import type { Prisma, $Enums } from '@prisma/client';

export interface CreateAnalysisData {
  projectId: string;
  type?: 'full' | 'quick' | 'scheduled';
  trigger?: 'manual' | 'scheduled' | 'webhook';
}

export interface UpdateAnalysisData {
  status?: 'queued' | 'running' | 'completed' | 'failed';
  pagesAnalyzed?: number;
  issuesFound?: number;
  overallScore?: number;
  summary?: Record<string, unknown>;
  completedAt?: Date;
}

export interface CreatePageAnalysisData {
  pageId: string;
  analysisId: string;
  score: number;
  meta?: Record<string, unknown>;
  headings?: Record<string, unknown>;
  images?: Record<string, unknown>;
  links?: Record<string, unknown>;
  performance?: Record<string, unknown>;
  structuredData?: Record<string, unknown>;
  accessibility?: Record<string, unknown>;
  content?: Record<string, unknown>;
}

export interface CreateIssueData {
  pageAnalysisId: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  code: string;
  message: string;
  selector?: string;
  recommendation: string;
  impact: number;
}

export class AnalysisRepository extends BaseRepository {
  findById(id: string) {
    return this.prisma.analysis.findUnique({
      where: { id },
      include: {
        pageAnalyses: {
          include: {
            issues: true,
            page: {
              select: { id: true, url: true, title: true },
            },
          },
        },
      },
    });
  }

  async findByProjectId(projectId: string, params: PaginationParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'createdAt';
    const order = params.order ?? 'desc';

    const where: Prisma.AnalysisWhereInput = { projectId };

    const [data, total] = await Promise.all([
      this.prisma.analysis.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.analysis.count({ where }),
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

  create(data: CreateAnalysisData) {
    return this.prisma.analysis.create({
      data: {
        projectId: data.projectId,
        type: data.type ?? 'full',
        trigger: data.trigger ?? 'manual',
      },
    });
  }

  updateStatus(id: string, status: string, data?: UpdateAnalysisData) {
    const updateData: Prisma.AnalysisUpdateInput = {
      status: status as 'queued' | 'running' | 'completed' | 'failed',
      updatedAt: this.now(),
    };

    if (status === 'completed') {
      updateData.completedAt = this.now();
    }

    if (data) {
      if (data.pagesAnalyzed !== undefined) updateData.pagesAnalyzed = data.pagesAnalyzed;
      if (data.issuesFound !== undefined) updateData.issuesFound = data.issuesFound;
      if (data.overallScore !== undefined) updateData.overallScore = data.overallScore;
      if (data.summary !== undefined) updateData.summary = data.summary as Prisma.InputJsonValue;
      if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;
    }

    return this.prisma.analysis.update({
      where: { id },
      data: updateData,
    });
  }

  getLatestByProjectId(projectId: string) {
    return this.prisma.analysis.findFirst({
      where: { projectId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      include: {
        pageAnalyses: {
          include: { issues: true },
        },
      },
    });
  }

  getTrend(projectId: string, limit = 10) {
    return this.prisma.analysis.findMany({
      where: { projectId, status: 'completed', overallScore: { not: null } },
      orderBy: { completedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        overallScore: true,
        issuesFound: true,
        pagesAnalyzed: true,
        completedAt: true,
        type: true,
      },
    });
  }

  savePageAnalysis(data: CreatePageAnalysisData) {
    return this.prisma.pageAnalysis.create({
      data: {
        pageId: data.pageId,
        analysisId: data.analysisId,
        score: data.score,
        meta: data.meta as Prisma.InputJsonValue ?? {},
        headings: data.headings as Prisma.InputJsonValue ?? {},
        images: data.images as Prisma.InputJsonValue ?? {},
        links: data.links as Prisma.InputJsonValue ?? {},
        performance: data.performance as Prisma.InputJsonValue ?? {},
        structuredData: data.structuredData as Prisma.InputJsonValue ?? {},
        accessibility: data.accessibility as Prisma.InputJsonValue ?? {},
        content: data.content as Prisma.InputJsonValue ?? {},
      },
    });
  }

  getPageAnalyses(analysisId: string) {
    return this.prisma.pageAnalysis.findMany({
      where: { analysisId },
      include: {
        issues: true,
        page: {
          select: { id: true, url: true, title: true },
        },
      },
    });
  }

  getIssues(pageAnalysisId: string, params?: { type?: string; category?: string }) {
    const where: Prisma.PageIssueWhereInput = { pageAnalysisId };

    if (params?.type) {
      where.type = params.type as 'error' | 'warning' | 'info';
    }

    if (params?.category) {
      where.category = params.category as $Enums.IssueCategory;
    }

    return this.prisma.pageIssue.findMany({
      where,
      orderBy: { impact: 'desc' },
    });
  }

  saveIssue(data: CreateIssueData) {
    return this.prisma.pageIssue.create({
      data: {
        pageAnalysisId: data.pageAnalysisId,
        type: data.type,
        category: data.category as $Enums.IssueCategory,
        code: data.code,
        message: data.message,
        selector: data.selector,
        recommendation: data.recommendation,
        impact: data.impact,
      },
    });
  }

  deleteOldAnalyses(projectId: string, keepCount: number) {
    return this.prisma.$transaction(async (tx) => {
      const analyses = await tx.analysis.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
        take: keepCount,
      });

      const keepIds = analyses.map(a => a.id);

      const deleteWhere: Prisma.AnalysisWhereInput = {
        projectId,
        id: { notIn: keepIds },
      };

      const oldAnalyses = await tx.analysis.findMany({
        where: deleteWhere,
        select: { id: true },
      });

      const oldIds = oldAnalyses.map(a => a.id);

      if (oldIds.length === 0) return { deletedCount: 0 };

      const oldPageAnalyses = await tx.pageAnalysis.findMany({
        where: { analysisId: { in: oldIds } },
        select: { id: true },
      });

      const oldPageAnalysisIds = oldPageAnalyses.map(pa => pa.id);

      if (oldPageAnalysisIds.length > 0) {
        await tx.pageIssue.deleteMany({
          where: { pageAnalysisId: { in: oldPageAnalysisIds } },
        });
        await tx.pageAnalysis.deleteMany({
          where: { analysisId: { in: oldIds } },
        });
      }

      const result = await tx.analysis.deleteMany({
        where: deleteWhere,
      });

      return { deletedCount: result.count };
    });
  }
}
