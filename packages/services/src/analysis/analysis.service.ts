import { AnalysisRepository } from '@lade/database';
import { NotFoundError } from '@lade/shared';
import type { Analysis, PaginationParams, AnalysisType } from '@lade/shared';
import { logger } from '@lade/config';
import { SeoScorerService } from './seo-scorer.service';

export class AnalysisService {
  constructor(
    private readonly analysisRepo: AnalysisRepository,
    private readonly seoScorer: SeoScorerService
  ) {}

  async triggerAnalysis(projectId: string, type: AnalysisType, triggeredBy: string): Promise<Analysis> {
    const analysis = await this.analysisRepo.create({
      projectId,
      type,
      status: 'queued',
      trigger: 'manual',
      pagesAnalyzed: 0,
      issuesFound: 0,
      overallScore: null,
    });

    logger.info('Analysis triggered', { analysisId: analysis.id, projectId, type, triggeredBy });
    return analysis;
  }

  async getAnalysis(id: string): Promise<Analysis> {
    const analysis = await this.analysisRepo.findById(id);
    if (!analysis) throw new NotFoundError('Analysis', id);
    return analysis;
  }

  async listAnalyses(projectId: string, params: PaginationParams) {
    return this.analysisRepo.findByProjectId(projectId, params);
  }

  async getLatestAnalysis(projectId: string): Promise<Analysis | null> {
    return this.analysisRepo.getLatestByProjectId(projectId);
  }

  async getTrend(projectId: string, limit = 10) {
    return this.analysisRepo.getTrend(projectId, limit);
  }

  async getIssues(
    analysisId: string,
    filters?: { type?: string; category?: string }
  ) {
    const analysis = await this.getAnalysis(analysisId);
    const pageAnalyses = await this.analysisRepo.getPageAnalyses(analysis.id);

    const allIssues = [];
    for (const pa of pageAnalyses) {
      const issues = await this.analysisRepo.getIssues(pa.id, filters);
      allIssues.push(...issues);
    }

    return allIssues;
  }

  calculateOverallScore(issues: { type: string; impact: number }[]): number {
    return this.seoScorer.calculateScore(issues);
  }
}
