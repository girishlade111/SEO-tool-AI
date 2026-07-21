import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ContentService } from '@lade/services';
import { ContentRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError, createContentSchema } from '@lade/shared';

const contentRepo = new ContentRepository();
const contentService = new ContentService(contentRepo);

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) throw new Error('projectId is required');

    const result = await contentService.list(projectId, {
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
      type: searchParams.get('type') as any ?? undefined,
      status: searchParams.get('status') as any ?? undefined,
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
    const parsed = createContentSchema.parse(body);
    const content = await contentService.create(parsed.projectId, session.user.id, parsed);

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
