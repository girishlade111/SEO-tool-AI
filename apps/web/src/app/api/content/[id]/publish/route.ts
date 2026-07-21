import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ContentService } from '@lade/services';
import { ContentRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const contentRepo = new ContentRepository();
const contentService = new ContentService(contentRepo);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const content = await contentService.publish(id, session.user.id);
    return NextResponse.json({ content });
  } catch (error) {
    return handleApiError(error);
  }
}
