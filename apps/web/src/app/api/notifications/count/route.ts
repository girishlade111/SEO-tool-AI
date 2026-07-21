import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { NotificationService } from '@lade/services';
import { NotificationRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const notifRepo = new NotificationRepository();
const notifService = new NotificationService(notifRepo);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();

    const count = await notifService.getUnreadCount(session.user.id);
    return NextResponse.json({ count });
  } catch (error) {
    return handleApiError(error);
  }
}
