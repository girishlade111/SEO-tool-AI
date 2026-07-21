import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { KeywordService } from '@lade/services';
import { KeywordRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const keywordRepo = new KeywordRepository();
const keywordService = new KeywordService(keywordRepo);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const keyword = await keywordService.getById(id);
    return NextResponse.json({ keyword });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    await keywordService.deleteKeyword(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
