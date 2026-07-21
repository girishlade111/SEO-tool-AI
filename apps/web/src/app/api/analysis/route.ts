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

    const params = {
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
    };

    const result = await analysisService.listAnalyses(projectId, params);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const body = await request.json();
    const analysis = await analysisService.triggerAnalysis(
      body.projectId,
      body.type,
      session.user.id
    );

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
