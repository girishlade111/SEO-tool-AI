import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { NotificationService } from '@lade/services';
import { NotificationRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const notifRepo = new NotificationRepository();
const notifService = new NotificationService(notifRepo);

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const { searchParams } = new URL(request.url);
    const result = await notifService.list(session.user.id, {
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
      unreadOnly: searchParams.get('unreadOnly') === 'true',
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    await notifService.markAllAsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
