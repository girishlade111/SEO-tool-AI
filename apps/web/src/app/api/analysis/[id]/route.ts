import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { AnalysisService, SeoScorerService } from '@lade/services';
import { AnalysisRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const analysisRepo = new AnalysisRepository();
const seoScorer = new SeoScorerService();
const analysisService = new AnalysisService(analysisRepo, seoScorer);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const analysis = await analysisService.getAnalysis(id);
    return NextResponse.json({ analysis });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET_ISSUES(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const issues = await analysisService.getIssues(id, {
      type: searchParams.get('type') ?? undefined,
      category: searchParams.get('category') ?? undefined,
    });
    return NextResponse.json({ issues });
  } catch (error) {
    return handleApiError(error);
  }
}
