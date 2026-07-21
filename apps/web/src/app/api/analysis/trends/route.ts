import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { AnalysisService, SeoScorerService } from '@lade/services';
import { AnalysisRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const analysisRepo = new AnalysisRepository();
const seoScorer = new SeoScorerService();
const analysisService = new AnalysisService(analysisRepo, seoScorer);

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) throw new Error('projectId is required');

    const limit = parseInt(searchParams.get('limit') ?? '10');
    const trend = await analysisService.getTrend(projectId, limit);
    return NextResponse.json({ trend });
  } catch (error) {
    return handleApiError(error);
  }
}
