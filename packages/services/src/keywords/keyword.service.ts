import { KeywordRepository } from '@lade/database';
import { NotFoundError } from '@lade/shared';
import type { Keyword, PaginationParams, SearchIntent } from '@lade/shared';
import { logger } from '@lade/config';

export class KeywordService {
  constructor(private readonly keywordRepo: KeywordRepository) {}

  async list(projectId: string, params: PaginationParams & { intent?: SearchIntent; minVolume?: number; maxDifficulty?: number }) {
    return this.keywordRepo.findByProjectId(projectId, params);
  }

  async getById(id: string): Promise<Keyword> {
    const keyword = await this.keywordRepo.findById(id);
    if (!keyword || keyword.deletedAt) throw new NotFoundError('Keyword', id);
    return keyword;
  }

  async addKeywords(projectId: string, keywords: Array<{ keyword: string; intent?: SearchIntent }>) {
    const created = await this.keywordRepo.bulkCreate(
      keywords.map((k) => ({
        projectId,
        keyword: k.keyword,
        intent: k.intent ?? 'informational',
        searchVolume: 0,
        difficulty: 0,
        cpc: 0,
        competition: 0,
        serpFeatures: [],
      }))
    );
    logger.info('Keywords added', { projectId, count: created.length });
    return created;
  }

  async deleteKeyword(id: string): Promise<void> {
    await this.keywordRepo.softDelete(id);
  }

  async getRankings(keywordId: string, params?: { searchEngine?: string }) {
    return this.keywordRepo.getRankings(keywordId, params);
  }

  async getGaps(projectId: string, competitorKeywords: string[]) {
    return this.keywordRepo.findGaps(projectId, competitorKeywords);
  }

  async createCluster(projectId: string, name: string, keywords: string[], topic: string) {
    return this.keywordRepo.createCluster({
      projectId,
      name,
      keywords,
      topic,
      totalVolume: 0,
      avgDifficulty: 0,
    });
  }
}
