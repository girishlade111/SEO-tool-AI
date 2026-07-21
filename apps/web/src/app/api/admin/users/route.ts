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
    const result = await adminService.listUsers({
      page: parseInt(searchParams.get('page') ?? '1'),
      limit: parseInt(searchParams.get('limit') ?? '20'),
      status: searchParams.get('status') as any ?? undefined,
      role: searchParams.get('role') as any ?? undefined,
      search: searchParams.get('search') ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
