import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { AdminService } from '@lade/services';
import { AdminRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const adminRepo = new AdminRepository();
const adminService = new AdminService(adminRepo);

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') throw new UnauthorizedError('Admin access required');

    const { searchParams } = new URL(request.url);
    const logs = await adminService.getAuditLogs({
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '50'),
      userId: searchParams.get('userId') ?? undefined,
      entity: searchParams.get('entity') ?? undefined,
      action: searchParams.get('action') ?? undefined,
    });

    return NextResponse.json(logs);
  } catch (error) {
    return handleApiError(error);
  }
}
