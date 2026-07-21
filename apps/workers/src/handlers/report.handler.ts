import { ReportRepository, AnalysisRepository } from '@lade/database';
import { providerRegistry, promptManager } from '@lade/ai-core';
import { logger } from '@lade/config';
import type { Job } from '../types';

const reportRepo = new ReportRepository();
const analysisRepo = new AnalysisRepository();

export async function handleReportGeneration(job: Job<{ reportId: string; projectId: string; type: string }>): Promise<void> {
  logger.info('Generating report', { reportId: job.data.reportId });

  const analyses = await analysisRepo.findByProjectId(job.data.projectId, { page: 1, pageSize: 10 }) as { data: Array<Record<string, unknown>> };
  const latestAnalysis = analyses.data?.[0];

  if (!latestAnalysis) {
    await reportRepo.update(job.data.reportId, { status: 'failed' });
    throw new Error('No analysis data available for report');
  }

  const prompt = promptManager.render('analysis:report', {
    projectName: 'Project',
    domain: '',
    period: 'Last 30 days',
    findings: JSON.stringify({ pagesAnalyzed: latestAnalysis.pagesAnalyzed as number, issuesFound: latestAnalysis.issuesFound as number }),
    issues: '[]',
    metrics: JSON.stringify({ score: latestAnalysis.overallScore as number | undefined }),
  });

  try {
    const response = await providerRegistry.generate({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt.rendered }],
      responseFormat: 'json',
    });

    await reportRepo.update(job.data.reportId, {
      status: 'completed',
      completedAt: new Date(),
      data: JSON.parse(response.content),
    });

    logger.info('Report generated', { reportId: job.data.reportId });
  } catch (error) {
    await reportRepo.update(job.data.reportId, { status: 'failed' });
    throw error;
  }
}
