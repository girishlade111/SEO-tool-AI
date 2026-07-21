import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { KeywordService } from '@lade/services';
import { KeywordRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const keywordRepo = new KeywordRepository();
const keywordService = new KeywordService(keywordRepo);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const body = await request.json();
    const gaps = await keywordService.getGaps(body.projectId, body.competitorKeywords);
    return NextResponse.json({ gaps });
  } catch (error) {
    return handleApiError(error);
  }
}
