import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { NotificationService } from '@lade/services';
import { NotificationRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const notifRepo = new NotificationRepository();
const notifService = new NotificationService(notifRepo);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new UnauthorizedError();
    const { id } = await params;
    await notifService.markAsRead(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
