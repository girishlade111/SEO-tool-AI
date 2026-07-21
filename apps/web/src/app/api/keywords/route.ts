import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { KeywordService } from '@lade/services';
import { KeywordRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const keywordRepo = new KeywordRepository();
const keywordService = new KeywordService(keywordRepo);

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) throw new Error('projectId is required');

    const result = await keywordService.list(projectId, {
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '50'),
      intent: searchParams.get('intent') as any ?? undefined,
      minVolume: searchParams.get('minVolume') ? parseInt(searchParams.get('minVolume')!) : undefined,
      maxDifficulty: searchParams.get('maxDifficulty') ? parseInt(searchParams.get('maxDifficulty')!) : undefined,
    });

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
    const keywords = await keywordService.addKeywords(body.projectId, body.keywords);

    return NextResponse.json({ keywords }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
