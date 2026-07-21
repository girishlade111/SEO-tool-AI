import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ContentService } from '@lade/services';
import { ContentRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const contentRepo = new ContentRepository();
const contentService = new ContentService(contentRepo);

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const content = await contentService.getById(id);
    return NextResponse.json({ content });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    const body = await request.json();
    const content = await contentService.update(id, session.user.id, body);
    return NextResponse.json({ content });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    await contentService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
