import { BaseRepository } from './base.repository';
import type { PaginationParams, PaginatedResult } from './user.repository';
import type { Prisma, $Enums } from '@prisma/client';

export interface CreateKeywordData {
  projectId: string;
  keyword: string;
  intent?: 'informational' | 'navigational' | 'commercial' | 'transactional';
  searchVolume?: number;
  difficulty?: number;
  cpc?: number;
  competition?: number;
  serpFeatures?: string[];
}

export interface UpdateKeywordData {
  intent?: 'informational' | 'navigational' | 'commercial' | 'transactional';
  searchVolume?: number;
  difficulty?: number;
  cpc?: number;
  competition?: number;
  serpFeatures?: string[];
}

export interface CreateClusterData {
  projectId: string;
  name: string;
  keywords: string[];
  topic: string;
  totalVolume: number;
  avgDifficulty: number;
}

export interface CreateRankingData {
  keywordId: string;
  position: number;
  url: string;
  searchEngine?: string;
  location?: string;
  trackedAt?: Date;
}

export interface KeywordQueryParams extends PaginationParams {
  intent?: string;
  minVolume?: number;
  maxDifficulty?: number;
}

export class KeywordRepository extends BaseRepository {
  findById(id: string) {
    return this.prisma.keyword.findFirst({
      where: { id, ...this.softDeleteFilter() },
      include: {
        rankings: {
          orderBy: { trackedAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { rankings: true },
        },
      },
    });
  }

  async findByProjectId(projectId: string, params: KeywordQueryParams): Promise<PaginatedResult<unknown>> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const sort = params.sort ?? 'createdAt';
    const order = params.order ?? 'desc';

    const where: Prisma.KeywordWhereInput = {
      projectId,
      ...this.softDeleteFilter(),
    };

    if (params.intent) {
      where.intent = params.intent as $Enums.SearchIntent;
    }

    if (params.minVolume !== undefined) {
      where.searchVolume = { gte: params.minVolume };
    }

    if (params.maxDifficulty !== undefined) {
      where.difficulty = { lte: params.maxDifficulty };
    }

    const [data, total] = await Promise.all([
      this.prisma.keyword.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          rankings: {
            orderBy: { trackedAt: 'desc' },
            take: 3,
          },
        },
      }),
      this.prisma.keyword.count({ where }),
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

  create(data: CreateKeywordData) {
    return this.prisma.keyword.create({
      data: {
        projectId: data.projectId,
        keyword: data.keyword,
        intent: data.intent ?? 'informational',
        searchVolume: data.searchVolume ?? 0,
        difficulty: data.difficulty ?? 0,
        cpc: data.cpc ?? 0,
        competition: data.competition ?? 0,
        serpFeatures: (data.serpFeatures ?? []) as Prisma.InputJsonValue,
      },
    });
  }

  bulkCreate(data: CreateKeywordData[]) {
    return this.prisma.keyword.createMany({
      data: data.map(k => ({
        projectId: k.projectId,
        keyword: k.keyword,
        intent: k.intent ?? 'informational',
        searchVolume: k.searchVolume ?? 0,
        difficulty: k.difficulty ?? 0,
        cpc: k.cpc ?? 0,
        competition: k.competition ?? 0,
        serpFeatures: (k.serpFeatures ?? []) as Prisma.InputJsonValue,
      })),
      skipDuplicates: true,
    });
  }

  update(id: string, data: UpdateKeywordData) {
    return this.prisma.keyword.update({
      where: { id },
      data: {
        ...data,
        serpFeatures: data.serpFeatures as Prisma.InputJsonValue ?? undefined,
        updatedAt: this.now(),
      },
    });
  }

  softDelete(id: string) {
    return this.prisma.keyword.update({
      where: { id },
      data: { deletedAt: this.now(), updatedAt: this.now() },
    });
  }

  async findGaps(projectId: string, competitorKeywords: string[]) {
    const existing = await this.prisma.keyword.findMany({
      where: {
        projectId,
        keyword: { in: competitorKeywords },
        ...this.softDeleteFilter(),
      },
      select: { keyword: true },
    });

    const existingSet = new Set(existing.map(k => k.keyword));
    return competitorKeywords.filter(kw => !existingSet.has(kw));
  }

  createCluster(data: CreateClusterData) {
    return this.prisma.keywordCluster.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        keywords: data.keywords as Prisma.InputJsonValue,
        topic: data.topic,
        totalVolume: data.totalVolume,
        avgDifficulty: data.avgDifficulty,
      },
    });
  }

  getClusters(projectId: string) {
    return this.prisma.keywordCluster.findMany({
      where: { projectId },
      orderBy: { totalVolume: 'desc' },
    });
  }

  addRanking(data: CreateRankingData) {
    return this.prisma.keywordRanking.create({
      data: {
        keywordId: data.keywordId,
        position: data.position,
        url: data.url,
        searchEngine: (data.searchEngine ?? 'google') as $Enums.SearchEngine,
        location: data.location ?? 'US',
        trackedAt: data.trackedAt ?? this.now(),
      },
    });
  }

  getRankings(keywordId: string, params?: { searchEngine?: string; limit?: number }) {
    const where: Prisma.KeywordRankingWhereInput = { keywordId };

    if (params?.searchEngine) {
      where.searchEngine = params.searchEngine as $Enums.SearchEngine;
    }

    return this.prisma.keywordRanking.findMany({
      where,
      orderBy: { trackedAt: 'desc' },
      take: params?.limit ?? 50,
    });
  }
}
