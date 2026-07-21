import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { AdminService } from '@lade/services';
import { AdminRepository } from '@lade/database';
import { handleApiError } from '@lade/config';
import { UnauthorizedError } from '@lade/shared';

const adminRepo = new AdminRepository();
const adminService = new AdminService(adminRepo);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') throw new UnauthorizedError('Admin access required');

    const stats = await adminService.getStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
