import { AnalysisRepository } from '@lade/database';
import { AnalysisService, SeoScorerService } from '@lade/services';
import { providerRegistry, registerPrompts, promptManager } from '@lade/ai-core';
import { logger } from '@lade/config';
import type { Job } from '../types';

const analysisRepo = new AnalysisRepository();
const seoScorer = new SeoScorerService();
const analysisService = new AnalysisService(analysisRepo, seoScorer);

registerPrompts();

export async function handlePageAnalysis(job: Job<{ analysisId: string; url: string; pageContent: string }>): Promise<void> {
  logger.info('Analyzing page', { analysisId: job.data.analysisId, url: job.data.url });

  await analysisRepo.update(job.data.analysisId, { status: 'running' });

  try {
    const prompt = promptManager.render('seo:page-analysis', {
      title: job.data.url,
      url: job.data.url,
      content: job.data.pageContent.slice(0, 10000),
    });

    const response = await providerRegistry.generate({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt.rendered }],
      responseFormat: 'json',
    });

    const result = JSON.parse(response.content);
    const score = result.score ?? 0;

    await analysisRepo.update(job.data.analysisId, {
      status: 'completed',
      overallScore: score,
      completedAt: new Date(),
    });

    logger.info('Page analysis completed', { analysisId: job.data.analysisId, score });
  } catch (error) {
    await analysisRepo.update(job.data.analysisId, { status: 'failed' });
    throw error;
  }
}
